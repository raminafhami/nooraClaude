import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  UnauthorizedException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import CustomError from '../providers/custom-error';

@Catch(UnauthorizedException)
export class UnauthorizedExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(UnauthorizedException.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    // Extract useful informations out of the exception's object.
    const status = exception.getStatus();
    const message = exception.message;
    return res
      .status(status)
      .json(
        new CustomError(
          status,
          message === 'Unauthorized'
            ? 'You are not authorized to access this API.'
            : message,
          undefined,
          req.url,
        ),
      );
  }
}
