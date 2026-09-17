import { Injectable, OnModuleInit } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import * as moment from 'moment-jalaali';
import { incomeMapping } from '../mapping/income.mapping';
import { IncomeSearchBody } from '../interfaces/income-search.interface';
import { SearchQueryBuilder } from '../search-query-builder';
import { IElasticFiltering } from 'src/common/decorators/elastic-filter.decorator';
import { ElasticFilterRules } from 'src/common/const/enums';
import { BaseSearchService } from './base-search.service';
moment.loadPersian({ usePersianDigits: false });

@Injectable()
export class IncomeSearchService
  extends BaseSearchService<IncomeSearchBody>
  implements OnModuleInit
{
  private readonly indexName = 'incomes';

  constructor(private readonly elasticsearchService: ElasticsearchService) {
    super(elasticsearchService);
  }

  async onModuleInit() {
    try {
      const indexExists = await this.elasticsearchService.indices.exists({
        index: this.indexName,
      });

      if (!indexExists) {
        await this.elasticsearchService.indices.create({
          index: this.indexName,
          body: {
            mappings: incomeMapping,
          },
        });
      } else {
        await this.elasticsearchService.indices.putMapping({
          index: this.indexName,
          ...incomeMapping,
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  async indexIncome(income: any) {
    const date = {
      year: moment(income.createdAt).locale('fa').jYear(),
      month: moment(income.createdAt).locale('fa').jMonth(),
      dayOfYear: moment(income.createdAt).locale('fa').jDayOfYear(),
    };

    return this.elasticsearchService.index<IncomeSearchBody>({
      index: this.indexName,
      id: income.id.toString(),
      body: {
        id: income.id.toString(),
        instanceId: income.instanceId,
        caseNo: income.caseNo,
        costId: income.costId,
        title: income.title,
        description: income.description,
        status: income.status,
        amount: income.amount,
        currency: income.currency,
        currencyRate: income.currencyRate,
        quantity: income.quantity,
        unit: income.unit,
        discount: income.discount,
        additionalFee: income.additionalFee,
        tax: income.tax,
        duty: income.duty,
        total: income.total,
        type: income.type,
        categoryId: income.categoryId,
        isDeleted: income.isDeleted,
        refIncomeId: income.refIncomeId,
        createdBy: income.createdBy,
        updatedBy: income.updatedBy,
        createdAt: income.createdAt,
        updatedAt: income.updatedAt,
        ...date,
      },
    });
  }

  async weeklyPidIncomes() {
    const now = new Date();
    now.setUTCHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 7);
    sevenDaysAgo.setUTCHours(0, 0, 0, 0);
    let searchQueryBuilder = new SearchQueryBuilder();
    const filters: IElasticFiltering[] = [
      {
        property: 'updatedAt',
        rule: ElasticFilterRules.RANGE,
        value: `${new Date(sevenDaysAgo).toISOString()},${now.toISOString()}`,
      },
      {
        property: 'status',
        rule: ElasticFilterRules.MATCH,
        value: `paid`,
      },
    ];
    let paidIncomesElasticQuery = searchQueryBuilder.addDynamicQuery(filters);
    paidIncomesElasticQuery.makeAggFunc('total', 'sum');
    let paidIncomesSearchQuery = searchQueryBuilder.build();

    const allPaidIncomes = await this.search(
      this.indexName,
      paidIncomesSearchQuery,
    );

    return {
      paidIncomesAmount: allPaidIncomes.data[0].total.value,
    };
  }
}
