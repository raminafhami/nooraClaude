import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ElasticConfigModule } from 'src/config/database/elastic/config.module';
import { ElasticConfigService } from 'src/config/database/elastic/config.service';
import { InstanceSearchService } from './services/instance-search.service';
import { SearchController } from './search.controller';
import { DebtSearchService } from './services/debt-search.service';
import { InspectionCostSearchService } from './services/inspection-cost-search.service';
import { DenormalizedInstanceSearchService } from './services/denormalized-instance-search.service';
import { UserSearchService } from './services/user-search.service';
import { IncomeSearchService } from './services/income-search.service';
import { InvoiceSearchService } from './services/invoice-search.service';
import { UserTaskSearchService } from './services/user-task-search.service';

@Module({
  imports: [
    ElasticConfigModule,
    ElasticsearchModule.registerAsync({
      imports: [ElasticConfigModule],
      useFactory: async (configService: ElasticConfigService) => ({
        node: configService.node,
        auth: {
          username: configService.username,
          password: configService.password,
        },
        tls: { rejectUnauthorized: false },
      }),
      inject: [ElasticConfigService],
    }),
  ],
  providers: [
    InstanceSearchService,
    DebtSearchService,
    InspectionCostSearchService,
    DenormalizedInstanceSearchService,
    UserSearchService,
    IncomeSearchService,
    InvoiceSearchService,
    UserTaskSearchService,
  ],
  exports: [
    InstanceSearchService,
    DebtSearchService,
    InspectionCostSearchService,
    DenormalizedInstanceSearchService,
    UserSearchService,
    IncomeSearchService,
    InvoiceSearchService,
    UserTaskSearchService,
  ],
  controllers: [SearchController],
})
export class SearchModule {}
