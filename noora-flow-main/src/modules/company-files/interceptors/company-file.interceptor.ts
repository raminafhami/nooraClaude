import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Optional,
  Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';

import * as multer from 'multer';
import { MULTER_MODULE_OPTIONS } from '@nestjs/platform-express/multer/files.constants';
import { MulterModuleOptions } from '@nestjs/platform-express/multer/interfaces';
import { transformException } from '@nestjs/platform-express/multer/multer/multer.utils';
import { Request } from 'express';
import { diskStorage } from 'multer';

import {
  addRandomStringToFileName,
  createFolderIfNotExists,
  fileFilterForInspection,
} from '../../files/file.utils';

@Injectable()
export class CompanyFileInterceptor implements NestInterceptor {
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

    const dst = `./app-docs/company`;

    await createFolderIfNotExists(dst);

    await new Promise<void>((resolve, reject) =>
      multer({
        ...this.options,
        storage: diskStorage({
          destination: dst,
          filename: addRandomStringToFileName,
        }),
        fileFilter: fileFilterForInspection(),
        limits: { fileSize: 1024 * 1024 * 50 },
      }).single('file')(ctx.getRequest(), ctx.getResponse(), (err: any) => {
        if (err) {
          const error = transformException(err);
          return reject(error);
        }
        resolve();
      }),
    );

    return next.handle();
  }
}
