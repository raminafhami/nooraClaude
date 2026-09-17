import { Catch, ArgumentsHost, BadRequestException } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';

@Catch(WsException, BadRequestException)
export class WsExceptionsFilter extends BaseWsExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    if (host.getType() === 'ws') {
      exception =
        exception instanceof BadRequestException
          ? new WsException({
              status: 'failure',
              description: exception.message,
              statusCode: 400,
              errors: exception.getResponse()['message'],
            })
          : exception;
      super.catch(exception, host);
    }
  }
}
