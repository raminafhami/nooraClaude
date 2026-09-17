import { Injectable, OnModuleInit } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import {
  InstanceSearchBody,
  InstanceSearchResult,
} from '../interfaces/instance-search.interface';
import { instanceMapping } from '../mapping/instance.mapping';
import * as moment from 'moment-jalaali';
import {
  ReportDto,
  PeriodEnum,
  RecentProcessesDto,
  ProcessCompletionReportDto,
} from '../dtos/report.dto';
import { BaseSearchService } from './base-search.service';
import { query } from 'express';
import { SearchQueryBuilder } from '../search-query-builder';
import { IElasticFiltering } from 'src/common/decorators/elastic-filter.decorator';
import { ElasticFilterRules } from 'src/common/const/enums';
moment.loadPersian({ usePersianDigits: false });
@Injectable()
export class InstanceSearchService
  extends BaseSearchService<InstanceSearchBody>
  implements OnModuleInit
{
  private readonly indexName = 'instances';

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
            mappings: instanceMapping,
          },
        });
      } else {
        await this.elasticsearchService.indices.putMapping({
          index: this.indexName,
          ...instanceMapping,
        });
      }
    } catch (error) {
      // Elasticsearch must not take the whole ERP down at boot: index
      // setup is retried the next time the application starts, and the
      // search features report their own errors when used.
      console.error(
        '[InstanceSearchService] Elasticsearch index setup skipped:',
        error?.message ?? error,
      );
    }
  }

  async getInspectionFeeReport(reportDto: ReportDto) {
    let dateAggs = null;
    const filterQuery = [];
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
                  field: `parameters.assignees.marketer`,
                },
              },
            ],
            filter: filterQuery,
          },
        },
        aggs: {
          fees: {
            composite: {
              size: 100,
              sources: [
                ...dateAggs,
                {
                  marketer: {
                    terms: { field: `parameters.assignees.marketer.id` },
                  },
                },
              ],
            },
            aggs: {
              first_record: {
                top_hits: {
                  size: 1,
                },
              },
              totalFee: {
                sum: { field: 'parameters.inspectionFeeInRial' },
              },
            },
          },
        },
      };
      if (afterKey) {
        body.aggs.fees.composite.after = afterKey;
      }
      const response = await this.elasticsearchService.search({
        index: this.indexName,
        body,
      });

      const buckets = response.aggregations.fees['buckets'].map((bucket) => {
        const date = moment(bucket.first_record.hits.hits[0]._source.date);
        return {
          date: dateTransform(date).format('jYYYY-jMM-jDD'),
          userId: bucket.key.marketer,
          userName:
            bucket.first_record.hits.hits[0]._source.parameters.assignees
              .marketer.name,
          fee: bucket.totalFee.value,
        };
      });

      allBuckets.push(...buckets);

      if (response.aggregations.fees['after_key']) {
        afterKey = response.aggregations.fees['after_key'];
      } else {
        break;
      }
    }
    return allBuckets;
  }

  async test() {
    try {
      const data = await this.elasticsearchService.search({
        index: 'denormalizedinstance',
        body: {
          aggs: {
            processDefinitionKey: {
              terms: {
                field: 'processDefinitionKey',
              },
              aggs: {
                totalInspectionFee: {
                  sum: {
                    field: 'parameters.inspectionFeeInRial',
                  },
                },
                'inspectionCost.total': {
                  nested: {
                    path: 'inspectionCosts',
                  },
                  aggs: {
                    'inspectionCost.total': {
                      sum: {
                        field: 'inspectionCosts.total',
                      },
                    },
                  },
                },
                diff: {
                  bucket_script: {
                    buckets_path: {
                      param1_sum: 'totalInspectionFee',
                      param2_sum: 'inspectionCostTotal>inspectionCost.total', // Corrected path here
                    },
                    script: 'params.param1_sum - params.param2_sum',
                  },
                },
              },
            },
          },
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  async getCustomersByRecentProcesses(reportDto: RecentProcessesDto) {
    const now = moment();
    const mustQuery: any[] = [
      {
        exists: {
          field: 'parameters.assignees.customer.id',
        },
      },
    ];
    if (reportDto.processDefinitionKey) {
      mustQuery.push({
        match: {
          processDefinitionKey: reportDto.processDefinitionKey,
        },
      });
    } else {
      mustQuery.push({
        bool: {
          should: [
            {
              regexp: {
                'processDefinitionKey.keyword': 'Inspection_Case.*',
              },
            },
            {
              regexp: {
                'processDefinitionKey.keyword': '.*Sampling.*',
              },
            },
          ],
        },
      });
    }
    const allBuckets = [];
    let afterKey = null;
    while (true) {
      const body: any = {
        query: {
          bool: {
            must: mustQuery,
          },
        },
        aggs: {
          group_by_customer_id: {
            terms: {
              field: 'parameters.assignees.customer.id',
              size: 10000000,
            },
            aggs: {
              data: {
                top_hits: {
                  size: 1,
                  sort: [
                    {
                      date: {
                        order: 'desc',
                      },
                    },
                  ],
                  _source: [
                    'processDefinitionKey',
                    'date',
                    'jalaliDate',
                    'year',
                    'month',
                    'dayOfYear',
                    'parameters.assignees.customer.name',
                    'parameters.assignees.customer.id',
                  ],
                },
              },
            },
          },
        },
      };
      if (afterKey) {
        body.aggs.group_by_customer_id.terms.after = afterKey;
      }
      const response: any = await this.elasticsearchService.search({
        index: this.indexName,
        body,
      });

      response.aggregations.group_by_customer_id['buckets'].forEach(
        (bucket) => {
          const date = moment(bucket.data?.hits.hits[0]?._source.date).add(
            reportDto.month,
            'months',
          );
          if (date.isBefore(now)) {
            allBuckets.push({
              processDefinitionKey:
                bucket.data.hits.hits[0]._source.processDefinitionKey,
              date: bucket.data.hits.hits[0]._source.date,
              jalaliDate: bucket.data.hits.hits[0]._source.jalaliDate,
              newDate: date,
              customerName:
                bucket.data.hits.hits[0]._source.parameters.assignees.customer
                  .name,
              customerId:
                bucket.data.hits.hits[0]._source.parameters.assignees.customer
                  .id,
            });
          }
        },
      );
      if (response.aggregations.group_by_customer_id['after_key']) {
        afterKey = response.aggregations.group_by_customer_id['after_key'];
      } else {
        break;
      }
    }
    if (reportDto.sort == 'desc') {
      allBuckets.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
    }
    if (reportDto.sort == 'asc') {
      allBuckets.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
    }

    // Pagination logic
    const page = reportDto.page;
    const pageSize = reportDto.size;
    const totalCount = allBuckets.length;

    const paginatedData = allBuckets.slice(
      page * pageSize,
      (page + 1) * pageSize,
    );

    return {
      count: totalCount,
      data: paginatedData,
    };
  }

  async getProcessPerformance(reportDto: ProcessCompletionReportDto) {
    const allBuckets = [];
    const filterQuery = [];

    if (reportDto.dateFrom) {
      filterQuery.push({
        range: {
          date: {
            gte: reportDto.dateFrom,
          },
        },
      });
    }
    if (reportDto.dateTo) {
      filterQuery.push({
        range: {
          date: {
            lte: reportDto.dateTo,
          },
        },
      });
    }

    let afterKey = null;
    while (true) {
      const body: any = {
        query: {
          bool: {
            filter: [...filterQuery],
          },
        },
        aggs: {
          group_by_definition_key: {
            terms: {
              field: 'processDefinitionKey',
              size: 10000,
            },
            aggs: {
              data: {
                top_hits: {
                  size: 1,
                  _source: {
                    includes: ['processDefinitionName'],
                  },
                },
              },
            },
          },
        },
      };
      if (afterKey) {
        body.aggs.group_by_definition_key.composite.after = afterKey;
      }
      const response: any = await this.elasticsearchService.search({
        index: this.indexName,
        body,
      });

      const successProcess: any = await this.elasticsearchService.search({
        index: this.indexName,
        body: {
          query: {
            bool: {
              must: [
                {
                  term: {
                    processPerformanceStatus: true,
                  },
                },
              ],
              filter: [...filterQuery],
            },
          },
          aggs: {
            group_by_definition_key: {
              terms: {
                field: 'processDefinitionKey',
                size: 10000,
              },
              aggs: {
                data: {
                  top_hits: {
                    size: 100,
                    _source: {
                      includes: [
                        'processDefinitionName',
                        'processPerformanceStatus',
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      });

      const buckets =
        response.aggregations.group_by_definition_key.buckets || [];
      const allSuccessProcess =
        successProcess.aggregations.group_by_definition_key.buckets.reduce(
          (acc, res) => {
            acc[res.key] = res.doc_count;
            return acc;
          },
          {},
        );
      const processedBuckets = buckets.map((bucket) => {
        return {
          processDefinitionKey: bucket.key,
          processDefinitionName:
            bucket?.data?.hits?.hits[0]?._source?.processDefinitionName,
          totalProcess: bucket.doc_count || 0,
          successProcess: allSuccessProcess[bucket.key] || 0,
          failProcess:
            (bucket.doc_count || 0) - (allSuccessProcess[bucket.key] || 0),
          successPercentages: allSuccessProcess[bucket.key]
            ? parseFloat(
                (
                  (allSuccessProcess[bucket.key] / (bucket.doc_count || 1)) *
                  100
                ).toFixed(2),
              )
            : 0,
          failPercentages: parseFloat(
            (
              ((bucket.doc_count - (allSuccessProcess[bucket.key] || 0)) /
                (bucket.doc_count || 1)) *
              100
            ).toFixed(2),
          ),
        };
      });

      allBuckets.push(...processedBuckets);
      if (response.aggregations.group_by_definition_key['after_key']) {
        afterKey = response.aggregations.group_by_definition_key['after_key'];
      } else {
        break;
      }
    }

    // Pagination logic
    const page = reportDto.page;
    const pageSize = reportDto.size;
    const totalCount = allBuckets.length;

    const paginatedData = allBuckets.slice(
      page * pageSize,
      (page + 1) * pageSize,
    );
    return {
      count: totalCount,
      data: paginatedData,
    };
  }

  async weeklyProcessReport() {
    const now = new Date();
    now.setUTCHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 7);
    sevenDaysAgo.setUTCHours(0, 0, 0, 0);

    const searchQueryBuilder = new SearchQueryBuilder();
    const filters: IElasticFiltering[] = [
      {
        property: 'date',
        rule: ElasticFilterRules.RANGE,
        value: `${new Date(sevenDaysAgo).toISOString()},${now.toISOString()}`,
      },
    ];
    const allProcessElasticQuery = searchQueryBuilder.addDynamicQuery(filters);
    allProcessElasticQuery.addAggregation('processDefinitionKey', 'terms');
    allProcessElasticQuery.addAggregation(
      'parameters.inspectionFeeInRial',
      'sum',
      10,
      'processDefinitionKey',
    );
    allProcessElasticQuery.addAggregation(
      'select',
      'top_hits',
      1,
      'processDefinitionKey',
      [''],
    );
    const allProcessSearchQuery = searchQueryBuilder.build();
    const allProcessInstances = await this.search(
      this.indexName,
      allProcessSearchQuery,
    );

    filters.push({
      property: 'status',
      rule: ElasticFilterRules.MATCH,
      value: 'completed',
    });
    const completedProcessElasticQuery =
      searchQueryBuilder.addDynamicQuery(filters);
    completedProcessElasticQuery.addAggregation(
      'processDefinitionKey',
      'terms',
    );
    allProcessElasticQuery.addAggregation(
      'select',
      'top_hits',
      1,
      'processDefinitionKey',
      [''],
    );
    const completedProcessSearchQuery = searchQueryBuilder.build();
    const completedProcessInstances = await this.search(
      this.indexName,
      completedProcessSearchQuery,
    );
    return {
      icProcessesNo:
        allProcessInstances.data.find((e) => e.key === 'inspection_case_ic')
          ?.doc_count || 0,
      coiProcessesNo:
        allProcessInstances.data.find((e) => e.key === 'inspection_case_coi')
          ?.doc_count || 0,
      samplingProcessesNo:
        allProcessInstances.data
          .filter((e) => /sampling/.test(e.key))
          .reduce((sum, e) => sum + e.doc_count, 0) || 0,
      icSalesAmountInRial:
        allProcessInstances.data.find((e) => e.key === 'inspection_case_ic')[
          'parameters.inspectionFeeInRial'
        ].value || 0,
      coiSalesAmountInRial:
        allProcessInstances.data.find((e) => e.key === 'inspection_case_coi')[
          'parameters.inspectionFeeInRial'
        ].value || 0,
      samplingSalesAmountInRial:
        allProcessInstances.data
          .filter((e) => /sampling/.test(e.key))
          .reduce(
            (sum, e) => sum + e['parameters.inspectionFeeInRial'].value,
            0,
          ) || 0,
      icCompletedProcessNo:
        completedProcessInstances.data.find(
          (e) => e.key === 'inspection_case_ic',
        )?.doc_count || 0,
      coiCompletedProcessNo:
        completedProcessInstances.data.find(
          (e) => e.key === 'inspection_case_coi',
        )?.doc_count || 0,
      samplingCompletedProcessNo:
        completedProcessInstances.data
          .filter((e) => /sampling/.test(e.key))
          .reduce((sum, e) => sum + e.doc_count, 0) || 0,
      to: moment(now).format('jYYYY/jMM/jDD'),
      from: moment(sevenDaysAgo).format('jYYYY/jMM/jDD'),
    };
  }
}
