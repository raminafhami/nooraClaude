import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { MongoError } from 'mongodb';
import CustomError from '../providers/custom-error';

@Catch(MongoError)
export class MongoExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(MongoExceptionFilter.name);

  catch(exception: MongoError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const message = exception.message;
    // this.logger.error(message);

    switch (exception.code) {
      case 11000:
        return res
          .status(400)
          .json(
            new CustomError(
              400,
              'Document already exists in the database.',
              undefined,
              req.url,
            ),
          );
      default:
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json(new CustomError(400, message, undefined, req.path));
    }
  }
}
