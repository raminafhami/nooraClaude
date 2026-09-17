import { Injectable, OnModuleInit } from '@nestjs/common';
import { BaseSearchService } from './base-search.service';
import { IInspectionCostSearchBody } from '../interfaces/inspection-cost-search.interface';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { InspectionCostMapping } from '../mapping/inspection-cost.mapping';
import { instanceMapping } from '../mapping/instance.mapping';

@Injectable()
export class InspectionCostSearchService
  extends BaseSearchService<IInspectionCostSearchBody>
  implements OnModuleInit
{
  private readonly indexName = 'inspectioncosts';

  constructor(private readonly elasticSearchService: ElasticsearchService) {
    super(elasticSearchService);
  }
  async onModuleInit() {
    try {
      const indexExists = await this.exists(this.indexName);
      if (!indexExists) {
        await this.createIndex(this.indexName, InspectionCostMapping);
      } else {
        await this.putMapping(this.indexName, instanceMapping);
      }
    } catch (error) {
      // Elasticsearch must not take the whole ERP down at boot: index
      // setup is retried the next time the application starts, and the
      // search features report their own errors when used.
      console.error(
        '[InspectionCostSearchService] Elasticsearch index setup skipped:',
        error?.message ?? error,
      );
    }
  }
}
