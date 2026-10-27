import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JobDescription } from './schemas/job-description.schema';
import { Personnel } from '../personnel/schemas/personnel.schema';
import { PersonnelExpertise } from '../personnel-expertise/schemas/personnel-expertise.schema';
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
// rows, shown on the HR training page) in line with the requirements of the
// jobs they currently hold:
// - a requirement of any held job with no row yet is added as "unqualified"
//   (only if that expertise still exists - rows are populated by title);
// - an "unqualified" row with no certificate that no held job requires any
//   more is removed;
// - when a job is taken away from the person (syncAfterJobsChange), every
//   row of that job goes whatever its status or certificate, unless one of
//   their other jobs requires it. If another job has its own same-titled
//   copy, an earned status/certificate moves to that copy first.
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
  ) {}

  /** @param dropped expertise ids of jobs the person was just unassigned from */
  async syncUser(userId: string, dropped: Iterable<string> = []) {
    const personnel = await this.personnelModel
      .findOne({ userId })
      .select('jobs')
      .lean();
    if (!personnel) return { added: 0, removed: 0 };

    const jobs = await this.jobDescriptionModel
      .find({ _id: { $in: personnel.jobs ?? [] } })
      .select('requirements.expertises')
      .lean();
    const requiredIds = jobs.flatMap(
      (job) => job.requirements?.expertises ?? [],
    );
    const existingExpertises = await this.expertiseModel
      .find({ _id: { $in: requiredIds } })
      .select('_id type title')
      .lean();
    const required = new Set(existingExpertises.map((e) => String(e._id)));

    const existing = await this.personnelExpertiseModel
      .find({ userId })
      .select('expertiseId status data')
      .lean();
    const present = new Set(existing.map((e) => String(e.expertiseId)));
    const droppedIds = new Set([...dropped].map(String));

    const toAdd = [...required].filter((id) => !present.has(id));
    const removed = existing.filter((e) => {
      const id = String(e.expertiseId);
      if (required.has(id)) return false;
      if (droppedIds.has(id)) return true;
      return e.status === 'unqualified' && !e.data?.certificateId;
    });
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

    return { added: toAdd.length, removed: toRemove.length };
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

  // The person's assigned jobs changed: everything of the jobs they lost is
  // dropped (shared items stay, see syncUser).
  async syncAfterJobsChange(
    userId: string,
    previousJobIds: Iterable<string>,
    currentJobIds: Iterable<string>,
  ) {
    const current = new Set([...currentJobIds].map(String));
    const lost = [...previousJobIds].map(String).filter((j) => !current.has(j));
    const lostJobs = lost.length
      ? await this.jobDescriptionModel
          .find({ _id: { $in: lost } })
          .select('requirements.expertises')
          .lean()
      : [];
    const dropped = lostJobs.flatMap((j) =>
      (j.requirements?.expertises ?? []).map((e) => String(e)),
    );
    return this.syncUser(userId, dropped);
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

  // A deleted expertise is removed from every job that required it (holders
  // re-synced), and its remaining "unqualified" rows go too - there is
  // nothing left to qualify for. Earned rows stay as the employee's record.
  async removeExpertiseFromJobs(expertiseId: string) {
    const id = new Types.ObjectId(expertiseId);
    const jobs = await this.jobDescriptionModel
      .find({ 'requirements.expertises': id })
      .select('_id')
      .lean();
    await this.jobDescriptionModel.updateMany(
      { 'requirements.expertises': id },
      { $pull: { 'requirements.expertises': id } },
    );
    for (const job of jobs) {
      await this.syncJobHolders(String(job._id));
    }
    await this.personnelExpertiseModel.deleteMany({
      expertiseId: id,
      status: 'unqualified',
      'data.certificateId': { $exists: false },
    });
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
