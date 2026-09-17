import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  StreamableFile,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import CustomResponse from '../providers/custom-response.service';
import CustomError from '../providers/custom-error';
import { CustomMessages } from '../const/custom-messages';
import { HtmlResponse } from 'src/modules/files/files.controller';

export class ResponseInterceptors implements NestInterceptor {
  intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
    return handler.handle().pipe(
      map((data) => {
        if (
          data instanceof CustomResponse ||
          data instanceof CustomError ||
          data instanceof StreamableFile
        ) {
          return data;
        } else if (data instanceof HtmlResponse) {
          return data.html;
        } else {
          return new CustomResponse(200, CustomMessages.SUCCESS, data);
        }
      }),
    );
  }
}
