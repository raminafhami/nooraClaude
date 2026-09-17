import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { Request } from 'express';

export const ElasticGroupParam = createParamDecorator(
  (validParams, ctx: ExecutionContext): string => {
    const req: Request = ctx.switchToHttp().getRequest();
    const groupBy = req.query?.groupBy as string;

    // check if the valid params sent is an array
    if (typeof validParams != 'object')
      throw new BadRequestException('Invalid group parameter');

    if (!validParams.includes(groupBy))
      throw new BadRequestException(`Invalid group property: ${groupBy}`);

    return groupBy;
  },
);
