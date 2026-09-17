import { Injectable, Scope } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';
import { WorkingTimeRegulation, WorkingTimeRegulationDocument } from '../schemas/working-time-regulation.schema';

@Injectable()
export class WorkingTimeRegulationRepositoryImpl extends BaseRepositoryImpl<WorkingTimeRegulationDocument> {
    constructor(
        @InjectModel("WorkingTimeRegulation")
        protected workingTimeRegulationModel: Model<WorkingTimeRegulationDocument>,
    ) {
        super(workingTimeRegulationModel);
    }
}
