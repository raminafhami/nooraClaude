import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { catchError, finalize, Observable, tap } from 'rxjs';

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor(@InjectConnection() private readonly connection: Connection) {}
  async intercept(context: ExecutionContext, next: CallHandler<any>) {
    const session = await this.connection.startSession();
    session.startTransaction();
    const request = context.switchToHttp().getRequest();

    request.mongoSession = session; // Attach the session to the request context
    return next.handle().pipe(
      tap(async () => {
        // Commit transaction if no error occurs
        await session.commitTransaction();
        await session.endSession();
      }),
      catchError(async (error) => {
        await session.abortTransaction();
        await session.endSession();
        throw error;
        // throw new BadRequestException('Request failed');
      }),
      finalize(async () => {
        // Always end the session to avoid leaks
        // await session.endSession();
      }),
    );
  }
}
