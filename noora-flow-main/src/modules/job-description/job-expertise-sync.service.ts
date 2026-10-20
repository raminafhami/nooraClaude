import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JobDescription } from './schemas/job-description.schema';
import { Personnel } from '../personnel/schemas/personnel.schema';
import { PersonnelExpertise } from '../personnel-expertise/schemas/personnel-expertise.schema';
import { Expertise } from '../expertise/schemas/expertise.schema';

// Keeps each employee's knowledge/training/skill checklist (PersonnelExpertise
// rows, shown on the HR training page) in line with the requirements of the
// jobs they currently hold:
// - a requirement of any held job with no row yet is added as "unqualified"
//   (only if that expertise still exists - rows are populated by title);
// - an "unqualified" row with no certificate that no held job requires any
//   more is removed. Qualified/learning rows are the employee's own record
//   and progress, so they stay.
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

  async syncUser(userId: string) {
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
      .select('_id')
      .lean();
    const required = new Set(existingExpertises.map((e) => String(e._id)));

    const existing = await this.personnelExpertiseModel
      .find({ userId })
      .select('expertiseId status data')
      .lean();
    const present = new Set(existing.map((e) => String(e.expertiseId)));

    const toAdd = [...required].filter((id) => !present.has(id));
    const toRemove = existing
      .filter(
        (e) =>
          !required.has(String(e.expertiseId)) &&
          e.status === 'unqualified' &&
          !e.data?.certificateId,
      )
      .map((e) => e._id);

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
    if (toRemove.length) {
      await this.personnelExpertiseModel.deleteMany({ _id: { $in: toRemove } });
    }

    return { added: toAdd.length, removed: toRemove.length };
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
