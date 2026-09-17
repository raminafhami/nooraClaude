import { Injectable, OnModuleInit } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import * as moment from 'moment-jalaali';
import { PeriodEnum, DebtReportDto } from '../dtos/report.dto';
import { debtMapping } from '../mapping/debt.mapping';
import { DebtSearchBody } from '../interfaces/debt-search.interface';
moment.loadPersian({ usePersianDigits: false });

@Injectable()
export class DebtSearchService implements OnModuleInit {
  private readonly index = 'debts';

  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async onModuleInit() {
    try {
      const indexExists = await this.elasticsearchService.indices.exists({
        index: this.index,
      });

      if (!indexExists) {
        await this.elasticsearchService.indices.create({
          index: this.index,
          body: {
            mappings: debtMapping,
          },
        });
      } else {
        await this.elasticsearchService.indices.putMapping({
          index: this.index,
          ...debtMapping,
        });
      }
    } catch (error) {
      // Elasticsearch must not take the whole ERP down at boot: index
      // setup is retried the next time the application starts, and the
      // search features report their own errors when used.
      console.error(
        '[DebtSearchService] Elasticsearch index setup skipped:',
        error?.message ?? error,
      );
    }
  }

  async indexDebt(debt: any) {
    const date = {
      year: moment(debt.instanceId.createdAt).locale('fa').jYear(),
      month: moment(debt.instanceId.createdAt).locale('fa').jMonth(),
      dayOfYear: moment(debt.instanceId.createdAt).locale('fa').jDayOfYear(),
      weekOfYear: moment(debt.instanceId.createdAt).locale('fa').jWeek(),
    };
    return this.elasticsearchService.index<DebtSearchBody>({
      index: this.index,
      id: debt.id.toString(),
      body: {
        id: debt.id.toString(),
        caseNo: debt.caseNo,
        userType: debt.userType,
        user: {
          id: debt.userId?.id,
          name: `${debt.userId?.name} ${debt.userId?.lastname}`,
          phoneNo: debt.userId?.phoneNo,
        },
        instanceId: debt.instanceId.id,
        isPaid: debt.isPaid,
        amount: debt.amount,
        date: debt.instanceId.createdAt,
        ...date,
      },
    });
  }

  async getDebts(reportDto: DebtReportDto) {
    let dateAggs = null;
    const filterQuery = [
      { term: { isPaid: reportDto.isPaid } },
      { term: { userType: 'cordinator' } },
    ] as any;
    let dateTransform = null;
    switch (reportDto.period) {
      case PeriodEnum.DAY:
        dateAggs = [
          { year: { terms: { field: 'year' } } },
          { dayOfYear: { terms: { field: 'dayOfYear' } } },
        ];
        dateTransform = (date) => date.locale('fa').startOf('day');
        break;
      case PeriodEnum.WEEK:
        dateAggs = [
          { year: { terms: { field: 'year' } } },
          { weekOfYear: { terms: { field: 'weekOfYear' } } },
        ];
        dateTransform = (date) => date.locale('fa').startOf('week');
        break;
      case PeriodEnum.MONTH:
        dateAggs = [
          { year: { terms: { field: 'year' } } },
          { month: { terms: { field: 'month' } } },
        ];
        dateTransform = (date) => date.startOf('jMonth');
        break;
      case PeriodEnum.YEAR:
        dateAggs = [{ year: { terms: { field: 'year' } } }];
        dateTransform = (date) => date.startOf('jYear');
        break;
      default:
        dateAggs = [{ year: { terms: { field: 'year' } } }];
    }
    if (reportDto.startDate) {
      filterQuery.push({
        range: {
          date: {
            gte: reportDto.startDate,
          },
        },
      });
    }
    if (reportDto.endDate) {
      filterQuery.push({
        range: {
          date: {
            lte: reportDto.endDate,
          },
        },
      });
    }

    const allBuckets = [];
    let afterKey = null;
    while (true) {
      const body: any = {
        query: {
          bool: {
            must: [
              {
                exists: {
                  field: 'user.id',
                },
              },
            ],
            filter: filterQuery,
          },
        },
        aggs: {
          debts: {
            composite: {
              size: 100,
              sources: [
                {
                  user: {
                    terms: { field: 'user.id' },
                  },
                },
                ...dateAggs,
              ],
            },
            aggs: {
              first_record: {
                top_hits: {
                  size: 1,
                },
              },
              totalAmount: {
                sum: { field: 'amount' },
              },
            },
          },
        },
      };

      if (afterKey) {
        body.aggs.debts.composite.after = afterKey;
      }

      const response = await this.elasticsearchService.search({
        index: this.index,
        body,
      });

      const buckets = response.aggregations.debts['buckets'].map((bucket) => {
        const date = moment(bucket.first_record.hits.hits[0]._source.date);
        return {
          date: dateTransform(date).format('jYYYY-jMM-jDD'),
          user: {
            id: bucket.key.user,
            name: bucket.first_record.hits.hits[0]._source.user.name,
            phoneNo: bucket.first_record.hits.hits[0]._source.user.phoneNo,
          },
          amount: bucket.totalAmount.value,
        };
      });

      allBuckets.push(...buckets);

      if (response.aggregations.debts['after_key']) {
        afterKey = response.aggregations.debts['after_key'];
      } else {
        break;
      }
    }
    return allBuckets;
  }
}
