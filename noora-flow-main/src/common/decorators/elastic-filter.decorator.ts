import {
  createParamDecorator,
  BadRequestException,
  ExecutionContext,
} from '@nestjs/common';

import { Request } from 'express';
import { ElasticFilterRules } from '../const/enums';

export interface IElasticFiltering {
  property: string;
  rule: ElasticFilterRules;
  value: string;
}

export const ElasticFilteringParams = createParamDecorator(
  (data: string[], ctx: ExecutionContext): IElasticFiltering[] => {
    const req = ctx.switchToHttp().getRequest();
    let filters = req.query.filters as any;

    if (!filters) return null;
    if (!Array.isArray(filters)) {
      filters = [filters];
    }
    // Ensure valid data object is provided
    if (typeof data !== 'object') {
      throw new BadRequestException('Invalid filter parameters');
    }

    const result = filters.every((f) => {
      return (
        f.match(
          /^[a-zA-Z0-9._]+::(term|terms|match|notMatch|match_phrase|multi_match|range|exists|wildcard|prefix|geo_distance|fuzzy|aggregation|composite)::[a-zA-Z0-9_,: \-]+$/,
        ) || f.match(/^[a-zA-Z0-9._]+::(exists)$/)
      );
    });

    if (!result)
      throw new BadRequestException('Invalid filter parameter format');

    const filterData: IElasticFiltering[] = [];
    filters.forEach((f) => {
      const [property, rule, value] = f.split('::');
      if (
        !data.includes(property) &&
        rule !== ElasticFilterRules.COMPOSITE &&
        rule !== ElasticFilterRules.MULTI_MATCH
      ) {
        throw new BadRequestException('Invalid filter property');
      }
      if (
        !Object.values(ElasticFilterRules).includes(rule as ElasticFilterRules)
      ) {
        throw new BadRequestException('Invalid filter rule');
      }

      if ((rule === 'exists' && value) || (!value && rule !== 'exists')) {
        throw new BadRequestException('Invalid value for the filter rule');
      }
      filterData.push({ property, rule, value });
    });
    return filterData;
  },
);
