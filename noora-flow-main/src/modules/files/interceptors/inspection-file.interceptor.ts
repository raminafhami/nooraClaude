import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Optional,
  Inject,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';

import * as multer from 'multer';
import { MULTER_MODULE_OPTIONS } from '@nestjs/platform-express/multer/files.constants';
import { MulterModuleOptions } from '@nestjs/platform-express/multer/interfaces';
import { transformException } from '@nestjs/platform-express/multer/multer/multer.utils';
import { Request } from 'express';
import { diskStorage } from 'multer';

import {
  fileFilter,
  addRandomStringToFileName,
  createFolderIfNotExists,
  fileFilterForInspection,
} from '../file.utils';
import { ProcessInstanceService } from 'src/modules/process-instances/process-instances.service';
import CustomError from 'src/common/providers/custom-error';
import { FilesService } from '../files.service';

@Injectable()
export class InspectionFileInterceptor implements NestInterceptor {
  protected options: MulterModuleOptions = {};

  constructor(
    @Optional()
    @Inject(MULTER_MODULE_OPTIONS)
    options: MulterModuleOptions = {},
    private readonly processInstanceService: ProcessInstanceService,
    private readonly filesService: FilesService,
  ) {
    this.options = options;
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const ctx = context.switchToHttp();
    const processInstanceId =
      ctx.getRequest<Request>().params.processInstanceId;
    const instance = await this.processInstanceService.findOne(
      processInstanceId,
      [],
    );

    if (!instance) throw new CustomError(400, 'process instance not exist.');

    const dst = `./inspection-files/${processInstanceId}`;

    await createFolderIfNotExists(dst);

    await new Promise<void>((resolve, reject) =>
      multer({
        ...this.options,
        storage: diskStorage({
          destination: dst,
          filename: addRandomStringToFileName,
        }),
        fileFilter: fileFilterForInspection(),
        limits: { fileSize: 1024 * 1024 * 500 },
      }).array('file')(ctx.getRequest(), ctx.getResponse(), (err: any) => {
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
