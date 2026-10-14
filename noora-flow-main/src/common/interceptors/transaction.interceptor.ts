import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { catchError, concatMap, finalize } from 'rxjs';

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor(@InjectConnection() private readonly connection: Connection) {}
  async intercept(context: ExecutionContext, next: CallHandler<any>) {
    const session = await this.connection.startSession();
    session.startTransaction();
    const request = context.switchToHttp().getRequest();

    request.mongoSession = session; // Attach the session to the request context
    return next.handle().pipe(
      // Commit before the response is emitted, so the client never sees a
      // success for writes that are not committed yet (a follow-up request,
      // e.g. the next autosave, must observe them).
      concatMap(async (data) => {
        await session.commitTransaction();
        return data;
      }),
      catchError(async (error) => {
        if (session.inTransaction()) {
          await session.abortTransaction();
        }
        throw error;
      }),
      finalize(() => {
        // Always end the session to avoid leaks
        session.endSession();
      }),
    );
  }
}
