import { Module } from '@nestjs/common';
import { IndexingService } from './indexing.service';
import { IndexingController } from './indexing.controller';
import { ProcessInstancesModule } from '../process-instances/process-instances.module';
import { QueueModule } from '../queue/queue.module';
import { UsersModule } from '../users/users.module';
import { InspectionCostsModule } from '../inspection-costs/inspection-costs.module';
import { SearchModule } from '../search/search.module';
import { CronJobService } from 'src/common/providers/cron-job.service';
import { IncomeModule } from '../income/income.module';
import { InvoiceModule } from '../invoice/invoice.module';
import { TasksModule } from '../tasks/tasks.module';

@Module({
  imports: [
    QueueModule,
    ProcessInstancesModule,
    UsersModule,
    InspectionCostsModule,
    SearchModule,
    IncomeModule,
    InvoiceModule,
    TasksModule,
  ],
  providers: [IndexingService, CronJobService],
  controllers: [IndexingController],
})
export class IndexingModule {}
