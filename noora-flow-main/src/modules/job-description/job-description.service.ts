import { Injectable } from '@nestjs/common';
import { CrudService } from 'src/shared/crud/service/crud.service';
import { JobDescriptionDocument } from './schemas/job-description.schema';
import { JobDescriptionRepositoryImpl } from './repository/job-description.repository';

@Injectable()
export class JobDescriptionService extends CrudService<JobDescriptionDocument> {
  constructor(
    private jobDescriptionRepositoryImpl: JobDescriptionRepositoryImpl,
  ) {
    super(jobDescriptionRepositoryImpl);
  }
  async findByJobName(name: string) {
    const jobs = await this.jobDescriptionRepositoryImpl.model.find({
      name: { $regex: new RegExp(name, 'i') },
    });
    return jobs.map((j) => j.id);
  }

  async findJobExpertises(jobId: string) {
    const job = await this.findById(jobId, 'ex');

    return !!job ? (job?.toJSON()?.requirements?.expertises as any) : null;
  }
}
