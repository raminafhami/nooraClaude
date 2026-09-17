import { BadRequestException } from '@nestjs/common';
import { AggFunctions, ElasticFilterRules } from 'src/common/const/enums';
import { IElasticFiltering } from 'src/common/decorators/elastic-filter.decorator';
import { IElasticSort } from 'src/common/decorators/elastic-sort.decorator';

export class SearchQueryBuilder {
  private query: any = {
    bool: { must: [], should: [], filter: [], must_not: [] },
  };
  private aggregations: any = {}; //Store aggregation
  private compositeAggregations: any = {}; //Store composite aggregation
  private subAggs: any = {};
  //Function to handle dynamic filters
  public addDynamicQuery(
    filters: IElasticFiltering[] = [],
  ): SearchQueryBuilder {
    if (!filters) return this;
    filters.forEach((filter) => {
      const { property, rule, value } = filter;

      switch (rule) {
        case ElasticFilterRules.TERM:
          this.query.bool.must.push({ term: { [property]: value } });
          break;
        case ElasticFilterRules.TERMS:
          this.query.bool.must.push({
            terms: { [property]: value.split(',') },
          });
          break;
        case ElasticFilterRules.MATCH:
          this.query.bool.must.push({ match: { [property]: value } });
          break;
        case ElasticFilterRules.NOT_MATCH:
          this.query.bool.must_not.push({ match: { [property]: value } });
          break;
        case ElasticFilterRules.MATCH_PHRASE:
          this.query.bool.must.push({ match_phrase: { [property]: value } });
          break;
        case ElasticFilterRules.MULTI_MATCH:
          const fields = property.split(',');
          this.query.bool.must.push({
            multi_match: {
              query: value,
              fields,
            },
          });
          break;
        case ElasticFilterRules.WILDCARD:
          this.query.bool.must.push({ wildcard: { [property]: value } });
          break;
        case ElasticFilterRules.PREFIX:
          this.query.bool.must.push({ prefix: { [property]: value } });
          break;
        case ElasticFilterRules.FUZZY:
          this.query.bool.must.push({ fuzzy: { [property]: value } });
          break;
        case ElasticFilterRules.RANGE:
          const [from, to] = value.split(',');

          this.query.bool.filter.push({
            range: {
              [property]: {
                gte: from,
                lte: to,
              },
            },
          });
          break;
        case ElasticFilterRules.EXISTS:
          this.query.bool.filter.push({ exists: { field: property } });
          break;
        case ElasticFilterRules.GEO_DISTANCE:
          const [distance, lat, lon] = value.split(',');
          this.query.bool.filter.push({
            geo_distance: {
              distance,
              [property]: {
                lat: parseFloat(lat),
                lon: parseFloat(lon),
              },
            },
          });
          break;
        case ElasticFilterRules.AGGREGATION: // Handle aggregation
          this.addAggregation(property, value);
          break;
        case ElasticFilterRules.COMPOSITE: // Handle composite aggregation
          const [sourceFields, afterKeyString] = value.split('::'); // Assuming '::' separates sources and afterKey
          const sources = sourceFields.split(','); // Multiple source fields are separated by commas
          const afterKey = afterKeyString
            ? JSON.parse(afterKeyString)
            : undefined; // Parse afterKey if it exists
          this.addCompositeAggregation(property, sources, afterKey);
          break;
        default:
          throw new BadRequestException(`Unsupported filter rule: ${rule}`);
      }
    });

    return this;
  }

  // Add standard aggregation (group by)
  public addAggregation(
    field: string,
    aggType: string,
    size: number = 10,
    parentAgg: string = '',
    select: string[] = [],
    nestedFields: string[] = [],
  ) {
    if (aggType === 'terms') {
      this.aggregations[field] = {
        [aggType]: {
          field: `${field}`, // Assuming this is for terms aggregation
          size,
        },
      };
    } else if (field === 'select') {
      if (!this.aggregations[parentAgg]['aggs']) {
        this.aggregations[parentAgg]['aggs'] = {};
      }
      this.aggregations[parentAgg]['aggs']['select'] = {
        top_hits: {
          _source: {
            includes: select,
          },
          size,
        },
      };
    } else {
      if (nestedFields.includes(field.split('.')[0])) {
        this.aggregations[parentAgg]['aggs'] = {
          ...this.aggregations[parentAgg]['aggs'],
          [field]: {
            nested: {
              path: field.split('.')[0], //
            },
            aggs: {
              [field]: { [aggType]: { field } },
            },
          },
        };
      } else {
        this.aggregations[parentAgg]['aggs'] = {
          ...this.aggregations[parentAgg]['aggs'],
          [field]: { [aggType]: { field } }, // For other aggregation types (like sum, avg, etc.)
        };
      }
    }
  }

  // Add composite aggregation
  public addCompositeAggregation(
    property: string,
    sources: string[],
    afterKey?: any,
    size: number = 100,
  ) {
    const compositeKey = property; // Define your composite key
    this.compositeAggregations[compositeKey] = {
      composite: {
        sources: sources.map((src) => ({
          [src]: {
            terms: {
              field: src,
            },
          },
        })),
        size, // You can also make this configurable
        after: afterKey || undefined, // Use the afterKey if provided
      },
    };
  }

  public sort(sortParameters: IElasticSort[] = []) {
    const sort = [];
    if (!sortParameters) return [];
    if (!Array.isArray(sortParameters)) {
      sortParameters = [sortParameters];
    }
    sortParameters.forEach((param) => {
      sort.push({
        [param.property]: {
          order: param.order,
        },
      });
    });
    return sort;
  }

  public customQuery(query: any): any {
    this.query = query;
    return this;
  }

  //makeAggregationWithOutSize
  public makeAggregation(field: string, type: string) {
    return {
      [field]: {
        [type]: {
          field,
        },
      },
    };
  }

  public makeAggFunc(field: string, type: string, nestedFields: string[] = []) {
    if (!nestedFields.includes(field.split('.')[0])) {
      this.subAggs = {
        ...this.subAggs,
        [field]: {
          [type]: {
            field,
          },
        },
      };
    } else {
      this.subAggs = {
        ...this.subAggs,
        [field]: {
          nested: {
            path: field.split('.')[0],
          },
          aggs: {
            [field]: {
              [type]: {
                field,
              },
            },
          },
        },
      };
    }
    return this.subAggs;
  }

  //Return final query
  public build(): any {
    const finalQuery: any = { query: {}, aggs: {} };
    finalQuery.query = this.query;

    // Add regular aggregations
    if (Object.keys(this.aggregations).length > 0) {
      finalQuery.aggs = this.aggregations;
    }

    // Add composite aggregations
    if (Object.keys(this.compositeAggregations).length > 0) {
      finalQuery.aggs = {
        ...finalQuery.aggs,
        ...this.compositeAggregations,
      };
    }

    if (Object.keys(this.subAggs).length > 0) {
      finalQuery.aggs = {
        ...finalQuery.aggs,
        ...finalQuery.compositeAggregations,
        ...this.subAggs,
      };
    }
    return finalQuery;
  }
}
