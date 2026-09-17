import { Controller, Post } from '@nestjs/common';
import { IndexingService } from './indexing.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('indexing')
@ApiTags('indexing')
@ApiBearerAuth('token')
export class IndexingController {
  constructor(private readonly indexingService: IndexingService) {}

  @Post('instances')
  async indexInstances() {
    await this.indexingService.indexInstances();
    return { message: 'Indexing instance started' };
  }

  @Post('debts')
  async indexDebts() {
    await this.indexingService.indexDebts();
    return { message: 'Indexing debt started' };
  }

  @Post('inspection-costs')
  async indexInspectionCosts() {
    await this.indexingService.indexInspectionCosts();
    return { message: 'Indexing inspection costs started' };
  }

  @Post('denormalized-instances')
  async indexDenormalizedInstances() {
    await this.indexingService.indexDenormalizedInstance();
    return { message: 'Indexing denormalized instances started' };
  }

  @Post('users')
  async indexUsers(){
    await this.indexingService.indexUsers()
    return { message: 'Indexing users started' };
  }

  @Post('incomes')
  async indexIncomes(){
    await this.indexingService.indexIncomes()
    return { message: 'Indexing incomes started' };
  }

  @Post('invoices')
  async indexInvoices(){
    await this.indexingService.indexInvoices()
    return { message: 'Indexing invoices started' };
  }

  @Post('user-tasks')
  async indexUserTasks(){
    await this.indexingService.indexUserTasks()
    return { message: 'Indexing userTasks started' };
  }

  @Post('all')
  async allIndexingService() {
    return await this.indexingService.allIndexingService();
  }
}
