import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { InstanceSearchService } from '../search/services/instance-search.service';
import { DebtSearchService } from '../search/services/debt-search.service';
import { InspectionCostSearchService } from '../search/services/inspection-cost-search.service';
import { DenormalizedInstanceSearchService } from '../search/services/denormalized-instance-search.service';
import { UserSearchService } from '../search/services/user-search.service';
import { IncomeSearchService } from '../search/services/income-search.service';
import { InvoiceSearchService } from '../search/services/invoice-search.service';
import { UserTaskSearchService } from '../search/services/user-task-search.service';

@Processor('indexing')
export class QueueProcessor {
  constructor(
    private readonly instanceSearchService: InstanceSearchService,
    private readonly debtSearchService: DebtSearchService,
    private readonly inspectionCostSearchService: InspectionCostSearchService,
    private readonly denormalizedInstanceSearchService: DenormalizedInstanceSearchService,
    private readonly userSearchService:UserSearchService,
    private readonly incomeSearchService: IncomeSearchService,
    private readonly invoiceSearchService: InvoiceSearchService,
    private readonly userTaskSearchService: UserTaskSearchService,
  ) {}

  @Process('index-instance')
  async handleIndexInstance(job: Job) {
    const instance = job.data;
    await this.instanceSearchService.indexDocument(
      'instances',
      instance.id,
      instance,
    );
  }

  @Process('index-debt')
  async handleIndexDebt(job: Job) {
    const debt = job.data;
    await this.debtSearchService.indexDebt(debt);
  }

  @Process('index-inspection-cost')
  async handleIndexInspectionCost(job: Job) {
    const inspectionCost = job.data;
    await this.inspectionCostSearchService.indexDocument(
      'inspectioncosts',
      inspectionCost.id,
      inspectionCost,
    );
  }

  @Process('index-denormalized-instance')
  async handleIndexDenormalizedInstance(job: Job) {
    const instance = job.data;
    await this.denormalizedInstanceSearchService.indexDocument(
      'denormalizedinstance',
      instance.id,
      instance,
    );
  }

  @Process('index-user')
  async handleIndexUser(job: Job) {
    const user = job.data;
    await this.userSearchService.indexUser(user);
  }

  @Process('index-income')
  async handleIndexIncome(job: Job) {
    const income = job.data;
    await this.incomeSearchService.indexIncome(income);
  }

  @Process('index-invoice')
  async handleIndexInvoice(job: Job) {
    const invoice = job.data;
    await this.invoiceSearchService.indexInvoice(invoice);
  }

  @Process('index-user-task')
  async handleIndexUserTask(job: Job) {
    const userTask = job.data;
    await this.userTaskSearchService.indexUserTask(userTask);
  }
}
