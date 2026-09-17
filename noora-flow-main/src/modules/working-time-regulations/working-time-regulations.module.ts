import { Module } from '@nestjs/common';
import { WorkingTimeRegulationsController } from './working-time-regulations.controller';
import { WorkingTimeRegulationsService } from './working-time-regulations.service';
import { WorkingTimeRegulation, WorkingTimeRegulationSchema } from './schemas/working-time-regulation.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkingTimeRegulationRepositoryImpl } from './repository/working-time-regulation.repository';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: 'WorkingTimeRegulation', schema: WorkingTimeRegulationSchema },
        ]),
    ],
    providers: [WorkingTimeRegulationsService, WorkingTimeRegulationRepositoryImpl],
    controllers: [WorkingTimeRegulationsController]
})
export class WorkingTimeRegulationsModule { }
