import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { Request } from 'express';
import { AggFunctions } from '../const/enums';

export interface IElasticAggFunc {
  property: string;
  func: string;
}

export const ElasticAggFuncParam = createParamDecorator(
  (validParams, ctx: ExecutionContext): IElasticAggFunc[] => {
    const req: Request = ctx.switchToHttp().getRequest();
    let aggFuncs = req.query.aggFunc as any;
    if (!aggFuncs) return null;

    if (!aggFuncs) return null;
    if (!Array.isArray(aggFuncs)) {
      aggFuncs = [aggFuncs];
    }

    // check if the valid params sent is an array
    if (typeof validParams != 'object')
      throw new BadRequestException('Invalid aggregation function parameter');

    // check the format of the aggFunc query param
    const pattern = /^([a-zA-Z0-9\.,]+)::(avg|sum|diff)$/;

    const aggFuncsData: IElasticAggFunc[] = [];
    // extract the property name and direction and check if they are valid
    aggFuncs.forEach((aggFunc) => {
      const result = aggFunc.match(pattern);
      if (!result) throw new BadRequestException('Invalid function format');

      const [property, func] = aggFunc.split('::');
      if (func === AggFunctions.DIFF) {
        const properties = property.split(',');
        if (
          !validParams.includes(properties[0]) &&
          !validParams.includes(properties[1])
        ) {
          throw new BadRequestException(
            `Invalid function property: ${property}`,
          );
        }
      } else {
        if (!validParams.includes(property))
          throw new BadRequestException(
            `Invalid function property: ${property}`,
          );
      }
      aggFuncsData.push({ property, func });
    });

    return aggFuncsData;
  },
);
