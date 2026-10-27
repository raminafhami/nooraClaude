import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as fs from 'fs';
import { Model, Types } from 'mongoose';
import { JobDescription } from './schemas/job-description.schema';
import { Personnel } from '../personnel/schemas/personnel.schema';
import { PersonnelExpertise } from '../personnel-expertise/schemas/personnel-expertise.schema';
import { PersonnelCertificate } from '../personnel-expertise/schemas/personnel-certificate.schema';
import { Expertise } from '../expertise/schemas/expertise.schema';

const STATUS_RANK: Record<string, number> = {
  unqualified: 0,
  learning: 1,
  qualified: 2,
};

// Job descriptions each keep their own copy of shared items, so "the same
// item" is same type + title (Arabic/Persian letters, ZWNJ and spaces aside)
// - the rule the training page uses to show it once.
const itemKey = (e: { type?: string; title?: string }) =>
  `${e.type}|${(e.title ?? '')
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/‌/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()}`;

// Keeps each employee's knowledge/training/skill checklist (PersonnelExpertise
// rows, shown on the HR training page) and their certificates (shown under
// «مستندات پرسنل») exactly in line with the requirements of the jobs they hold
// right now:
// - a requirement of any held job with no row yet is added as "unqualified"
//   (only if that expertise still exists - rows are populated by title);
// - every row no held job requires goes, whatever its status or certificate.
//   If a held job has its own same-titled copy, an earned status/certificate
//   moves to that copy first;
// - a certificate no remaining row points to goes too (record and file).
@Injectable()
export class JobExpertiseSyncService {
  private readonly logger = new Logger(JobExpertiseSyncService.name);

  constructor(
    @InjectModel(JobDescription.name)
    private readonly jobDescriptionModel: Model<JobDescription>,
    @InjectModel(Personnel.name)
    private readonly personnelModel: Model<Personnel>,
    @InjectModel(PersonnelExpertise.name)
    private readonly personnelExpertiseModel: Model<PersonnelExpertise>,
    @InjectModel(Expertise.name)
    private readonly expertiseModel: Model<Expertise>,
    @InjectModel(PersonnelCertificate.name)
    private readonly personnelCertificateModel: Model<PersonnelCertificate>,
  ) {}

  // Expertise ids (existing ones only) required by each person's current jobs.
  async requiredByUser(userIds: string[]): Promise<Map<string, Set<string>>> {
    const personnel = await this.personnelModel
      .find({ userId: { $in: userIds } })
      .select('userId jobs')
      .lean();
    const jobs = await this.jobDescriptionModel
      .find({ _id: { $in: personnel.flatMap((p) => p.jobs ?? []) } })
      .select('requirements.expertises')
      .lean();
    const existing = new Set(
      (
        await this.expertiseModel
          .find({ _id: { $in: jobs.flatMap((j) => j.requirements?.expertises ?? []) } })
          .select('_id')
          .lean()
      ).map((e) => String(e._id)),
    );
    const byJob = new Map(
      jobs.map((j) => [
        String(j._id),
        (j.requirements?.expertises ?? []).map(String).filter((e) => existing.has(e)),
      ]),
    );
    const result = new Map<string, Set<string>>();
    for (const p of personnel) {
      result.set(
        String(p.userId),
        new Set((p.jobs ?? []).flatMap((j) => byJob.get(String(j)) ?? [])),
      );
    }
    return result;
  }

  async syncUser(userId: string) {
    const personnel = await this.personnelModel
      .findOne({ userId })
      .select('jobs')
      .lean();
    if (!personnel) return { added: 0, removed: 0 };

    const required =
      (await this.requiredByUser([userId])).get(String(userId)) ??
      new Set<string>();
    const existingExpertises = await this.expertiseModel
      .find({ _id: { $in: [...required] } })
      .select('_id type title')
      .lean();

    const existing = await this.personnelExpertiseModel
      .find({ userId })
      .select('expertiseId status data')
      .lean();
    const present = new Set(existing.map((e) => String(e.expertiseId)));

    const toAdd = [...required].filter((id) => !present.has(id));
    const removed = existing.filter((e) => !required.has(String(e.expertiseId)));
    const toRemove = removed.map((e) => e._id);

    if (toAdd.length) {
      // Upsert on (userId, expertiseId) so a concurrent sync or a manual
      // entry made in between is never duplicated or overwritten.
      await this.personnelExpertiseModel.bulkWrite(
        toAdd.map((expertiseId) => ({
          updateOne: {
            filter: {
              userId: new Types.ObjectId(userId),
              expertiseId: new Types.ObjectId(expertiseId),
            },
            update: {
              $setOnInsert: {
                status: 'unqualified',
                modifyBy: null,
                modifyAt: null,
              },
            },
            upsert: true,
          },
        })),
      );
    }
    const earned = removed.filter(
      (e) => e.status !== 'unqualified' || e.data?.certificateId,
    );
    if (earned.length) {
      await this.handOverToCopies(userId, earned, existingExpertises);
    }
    if (toRemove.length) {
      await this.personnelExpertiseModel.deleteMany({ _id: { $in: toRemove } });
    }
    await this.removeUnusedCertificates(userId);

    return { added: toAdd.length, removed: toRemove.length };
  }

  // Certificates of the person that no checklist row points to any more.
  private async removeUnusedCertificates(userId: string) {
    const inUse = (
      await this.personnelExpertiseModel
        .find({ userId, 'data.certificateId': { $exists: true, $ne: null } })
        .select('data.certificateId')
        .lean()
    ).map((r) => String(r.data.certificateId));
    const unused = await this.personnelCertificateModel
      .find({ userId, _id: { $nin: inUse } })
      .select('_id path')
      .lean();
    for (const certificate of unused) {
      if (certificate.path) {
        try {
          fs.unlinkSync(certificate.path);
        } catch {
          // already gone from disk
        }
      }
    }
    if (unused.length) {
      await this.personnelCertificateModel.deleteMany({
        _id: { $in: unused.map((c) => c._id) },
      });
    }
  }

  // An earned row that is going passes its status (and certificate) to a
  // same-titled row of a job the person still holds, if that one is lower.
  private async handOverToCopies(
    userId: string,
    earned: { expertiseId: any; status: string; data?: any }[],
    requiredDocs: { _id: any; type?: string; title?: string }[],
  ) {
    const requiredByKey = new Map<string, string[]>();
    for (const d of requiredDocs) {
      const k = itemKey(d);
      requiredByKey.set(k, [...(requiredByKey.get(k) ?? []), String(d._id)]);
    }
    const earnedDocs = await this.expertiseModel
      .find({ _id: { $in: earned.map((e) => e.expertiseId) } })
      .select('_id type title')
      .lean();
    const keyOf = new Map(earnedDocs.map((d) => [String(d._id), itemKey(d)]));

    for (const row of earned) {
      const key = keyOf.get(String(row.expertiseId));
      const targets = key ? requiredByKey.get(key) : undefined;
      if (!targets?.length) continue;
      const copies = await this.personnelExpertiseModel
        .find({ userId, expertiseId: { $in: targets } })
        .select('_id status data')
        .lean();
      for (const copy of copies) {
        const set: Record<string, unknown> = {};
        if ((STATUS_RANK[copy.status] ?? 0) < (STATUS_RANK[row.status] ?? 0)) {
          set.status = row.status;
        }
        if (row.data?.certificateId && !copy.data?.certificateId) {
          set['data.certificateId'] = row.data.certificateId;
        }
        if (Object.keys(set).length) {
          await this.personnelExpertiseModel.updateOne(
            { _id: copy._id },
            { $set: set },
          );
        }
      }
    }
  }

  // Re-sync everyone holding a job after its requirements changed.
  async syncJobHolders(jobId: string) {
    const holders = await this.personnelModel
      .find({ jobs: jobId })
      .select('userId')
      .lean();
    for (const holder of holders) {
      await this.syncUser(String(holder.userId));
    }
  }

  // A deleted job is taken away from everyone who held it.
  async removeJobFromHolders(jobId: string) {
    const holders = await this.personnelModel
      .find({ jobs: jobId })
      .select('userId')
      .lean();
    await this.personnelModel.updateMany(
      { jobs: jobId },
      { $pull: { jobs: new Types.ObjectId(jobId) } },
    );
    for (const holder of holders) {
      await this.syncUser(String(holder.userId));
    }
  }

  // A deleted expertise is removed from every job that required it, and
  // everyone with a row for it is re-synced, so those rows go.
  async removeExpertiseFromJobs(expertiseId: string) {
    const id = new Types.ObjectId(expertiseId);
    await this.jobDescriptionModel.updateMany(
      { 'requirements.expertises': id },
      { $pull: { 'requirements.expertises': id } },
    );
    const userIds = await this.personnelExpertiseModel.distinct('userId', {
      expertiseId: id,
    });
    for (const userId of userIds) {
      await this.syncUser(String(userId));
    }
  }

  // The job/personnel change itself is already saved when these run, so a
  // failed sync is logged instead of failing that request; the next change
  // to the same person or job brings the checklist back in line.
  async trySync(label: string, run: () => Promise<unknown>) {
    try {
      await run();
    } catch (err) {
      this.logger.error(`checklist sync failed (${label})`, err?.stack ?? err);
    }
  }
}
