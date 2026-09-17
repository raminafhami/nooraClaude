import { Injectable } from '@nestjs/common';
import { WorkingTimeRegulation } from './schemas/working-time-regulation.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WorkingTimeRegulationRepositoryImpl } from './repository/working-time-regulation.repository';
import { CreateWorkingTimeRegulationDto } from './dto/create-working-time-regulation.dto';

@Injectable()
export class WorkingTimeRegulationsService {
    constructor(
        @InjectModel('WorkingTimeRegulation') private workingTimeRegulationModel: Model<WorkingTimeRegulation>,
        private workingTimeRegulationImpl: WorkingTimeRegulationRepositoryImpl,) { }

    async createCreateWorkingTimeRegulation(createWorkingTimeRegulationDto: CreateWorkingTimeRegulationDto) {
        return await this.workingTimeRegulationImpl.create(createWorkingTimeRegulationDto)
    }

    async getWorkingTimeRegulations() {
        return await this.workingTimeRegulationImpl.find()
    }
}
