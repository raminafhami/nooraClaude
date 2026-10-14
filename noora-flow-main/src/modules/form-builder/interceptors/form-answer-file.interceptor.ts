import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
  Optional,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import * as multer from 'multer';
import { diskStorage } from 'multer';
import { Request } from 'express';
import { MULTER_MODULE_OPTIONS } from '@nestjs/platform-express/multer/files.constants';
import { MulterModuleOptions } from '@nestjs/platform-express/multer/interfaces';
import { transformException } from '@nestjs/platform-express/multer/multer/multer.utils';
import {
  addRandomStringToFileName,
  createFolderIfNotExists,
  fileFilterForInspection,
} from '../../files/file.utils';

// Hard upper bound for any single answer file; the per-question limits
// (size, count, types) are enforced by FormAnswerFileService afterwards.
export const FORM_ANSWER_FILE_MAX_BYTES = 1024 * 1024 * 20;

// Stored under the persistent `documents` volume, one folder per occurrence.
@Injectable()
export class FormAnswerFileInterceptor implements NestInterceptor {
  protected options: MulterModuleOptions = {};

  constructor(
    @Optional()
    @Inject(MULTER_MODULE_OPTIONS)
    options: MulterModuleOptions = {},
  ) {
    this.options = options;
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const ctx = context.switchToHttp();
    const { occurrenceId } = ctx.getRequest<Request>().params;
    if (!/^[a-f0-9]{24}$/i.test(occurrenceId ?? '')) {
      throw new BadRequestException('شناسه نوبت معتبر نیست.');
    }

    const dst = `./documents/form-builder/${occurrenceId}`;
    await createFolderIfNotExists(dst);

    await new Promise<void>((resolve, reject) =>
      multer({
        ...this.options,
        storage: diskStorage({
          destination: dst,
          filename: addRandomStringToFileName,
        }),
        fileFilter: fileFilterForInspection(),
        limits: { fileSize: FORM_ANSWER_FILE_MAX_BYTES },
      }).single('file')(ctx.getRequest(), ctx.getResponse(), (err: any) => {
        if (err) {
          return reject(transformException(err));
        }
        resolve();
      }),
    );

    return next.handle();
  }
}
