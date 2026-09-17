import { AggregationsAggregate } from '@elastic/elasticsearch/lib/api/types';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { PeriodEnum } from '../dtos/report.dto';
import * as moment from 'moment-jalaali';
import { BuildPeriodicReportDto } from '../dtos/build-periodic-report.dto';
import {
  flattenObject,
  flattenObjectIrreversible,
} from 'src/common/utils/data.util';
moment.loadPersian({ usePersianDigits: false });

export abstract class BaseSearchService<T> {
  constructor(private readonly searchService: ElasticsearchService) {}

  public async createIndex(index: string, mappings: any): Promise<void> {
    try {
      await this.searchService.indices.create({
        index,
        body: {
          mappings,
        },
      });
    } catch (error) {
      throw new Error(`Unable to create index ${index}`);
    }
  }

  public async putMapping(index: string, mapping: any): Promise<void> {
    try {
      await this.searchService.indices.putMapping({
        index,
        ...mapping,
      });
    } catch (error) {
      throw new Error(`Unable to map data for index ${index}`);
    }
  }

  public async exists(index: string): Promise<boolean> {
    try {
      return await this.searchService.indices.exists({ index });
    } catch (error) {
      throw new Error('Elastic error ocurred');
    }
  }

  public async index(index: string, document: T): Promise<void> {
    try {
      await this.searchService.index({
        index,
        body: document,
      });
    } catch (error) {
      throw new Error('Failed to index documents');
    }
  }

  public async indexDocument(
    index: string,
    id: string,
    document: T,
  ): Promise<void> {
    try {
      await this.searchService.index({
        index,
        id,
        body: document,
      });
    } catch (error) {
      throw new Error(`Failed to index document: ${error.message}`);
    }
  }

  public async searchWithBuilder(body: any) {
    return await this.searchService.search(body.toJSON());
  }

  public async search(
    index: string,
    body: any,
    page: number = 0,
    size: number = 10,
    sort: any = null,
  ): Promise<
    | { data: T[]; total: number; page: number; size: number }
    | { data: any; total: number }
  > {
    try {
      const from = page * size;
      //prepare search request body
      const elasticBody: any = {
        from,
        size,
        query: {},
      };
      if (sort) {
        elasticBody.sort = sort;
      }
      elasticBody.query = body.query;

      const response = await this.searchService.search({
        index,
        body: {
          ...elasticBody,
          track_total_hits: true,
          aggs: body.aggs,
        },
      });

      const total =
        typeof response.hits?.total === 'object'
          ? response.hits.total.value
          : response.hits?.total || 0;
      if (Object.values(body.aggs).length !== 0) {
        const buckets = Object.values(response.aggregations)[0]['buckets'];
        let results = [];
        if(!buckets){
          results.push({
            ...response.aggregations
          })
        }else{
          buckets.map((bucket: any) => {
            results.push({
              ...bucket,
              select: { ...bucket.select.hits.hits[0]._source },
            });
          });
        }



        return { data: results, total, page, size };
      }
      const hits = response.hits?.hits || [];
      const results = hits.map((hit) => hit._source as T);

      return { data: results, total, page, size };
    } catch (error) {
      throw new Error('Failed to fetch documents');
    }
  }

  public async buildPeriodicReport(
    buildPeriodicReportDto: BuildPeriodicReportDto,
  ): Promise<any> {
    try {
      let dateAggs = null;
      let dateTransform = null;
      switch (buildPeriodicReportDto.period) {
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

      const allBuckets = [];
      let afterKey = null;
      while (true) {
        const body: any = {
          query: buildPeriodicReportDto.query,
          aggs: {
            fees: {
              composite: {
                size: buildPeriodicReportDto.size,
                sources: [...dateAggs, ...buildPeriodicReportDto.aggs],
              },
              aggs: {
                first_record: {
                  top_hits: {
                    size: 1,
                  },
                },
                // total: {
                //   ...buildPeriodicReportDto.compiledAggFunc,
                // },
                ...buildPeriodicReportDto.compiledAggFunc,
              },
            },
          },
        };
        if (afterKey) {
          body.aggs.fees.composite.after = afterKey;
        }
        const response = await this.searchService.search({
          index: buildPeriodicReportDto.index,
          body,
          track_total_hits: true,
        });
        const buckets = response.aggregations.fees['buckets'].map((bucket) => {
          const date = moment(bucket.first_record.hits.hits[0]._source.date);
          const props: any = {};
          let extractedObject;
          if (buildPeriodicReportDto.select) {
            extractedObject = buildPeriodicReportDto.select
              // Extract properties where keys are in the array
              .split(',')
              .reduce((acc, key) => {
                let flattenedObject = flattenObject(
                  bucket.first_record.hits.hits[0]._source,
                );
                if (Object.keys(flattenedObject).includes(key)) {
                  acc[key] = flattenedObject[key]; // Add the key-value pair to the accumulator
                }
                return acc;
              }, {});
          }
          let result = {
            date: dateTransform(date).format('jYYYY-jMM-jDD'),
            key: bucket.key[buildPeriodicReportDto.groupBy],
            props: extractedObject,
            doc_count: bucket.doc_count,
          };
          delete bucket.first_record;
          delete bucket.key;
          delete bucket.doc_count;

          return {
            ...result,
            data: bucket,
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
    } catch (error) {
      throw new Error('Failed to fetch documents');
    }
  }

  public async findById(index: string, id: string): Promise<T | null> {
    try {
      const { _source } = await this.searchService.get({ index, id });
      return _source as T;
    } catch (error) {
      throw new Error('Failed to fetch document');
    }
  }

  public async deleteById(index: string, id: string): Promise<void> {
    try {
      await this.searchService.delete({
        index,
        id,
      });
    } catch (error) {
      throw new Error('Failed to delete document');
    }
  }

  public async remapping(index: string, mappings: any) {
    await this.searchService.indices.delete({ index });
    await this.searchService.indices.create({
      index,
      body: {
        mappings,
      },
    });
  }
}
