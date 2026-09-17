import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Request, Response } from 'express';
import CustomError from '../providers/custom-error';

@Catch(Error)
export class OtherExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    console.log(exception);

    if (exception.code == 'ENOENT') {
      res
        .status(404)
        .json(new CustomError(404, 'Asset not found', undefined, req.url));
    } else if (exception instanceof CustomError) {
      res.status(exception.statusCode).json({ ...exception, path: req.url });
    } else if (exception.name === 'CastError') {
      res
        .status(400)
        .json(new CustomError(500, 'Not found', undefined, req.url));
    } else {
      res
        .status(500)
        .json(
          new CustomError(500, 'Internal Server Error', undefined, req.url),
        );
    }
  }
}
