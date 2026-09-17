import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as fs from 'fs';
import CustomError from '../providers/custom-error';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const status = exception.getStatus();

    const message = exception.message;

    // if (req.file && !req.file.buffer) {
    //   try {
    //     fs.unlinkSync(req.file.path);
    //   } catch (error) {
    //     this.logger.error(error);
    //   }
    // }

    // logger.error(message);
    if (status == 400 || status == 413) {
      return res
        .status(status)
        .json(
          new CustomError(status, message, exception.response.message, req.url),
        );
    }
    return res
      .status(status)
      .json(new CustomError(status, message, undefined, req.url));
  }
}
