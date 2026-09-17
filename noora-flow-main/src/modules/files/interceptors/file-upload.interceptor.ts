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
} from '../file.utils';
import { ProcessInstanceService } from 'src/modules/process-instances/process-instances.service';
import CustomError from 'src/common/providers/custom-error';
import { FilesService } from '../files.service';

@Injectable()
export class FileUploadInterceptor implements NestInterceptor {
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
    const fieldNames = ctx.getRequest<Request>().params.fieldNames.split(',');
    const folder = ctx.getRequest<Request>().params.folder;
    const instance = await this.processInstanceService.findOne(
      processInstanceId,
      [],
    );
    const dst = `./documents/${processInstanceId}/${folder}`;
    const fieldsData = fieldNames
      .map((name) => instance.documents.types[name])
      .filter((data) => !!data);
    if (fieldsData.length != fieldNames.length)
      throw new CustomError(400, 'fieldsName not exist.');

    await createFolderIfNotExists(dst);

    const isMultiple = fieldsData.every((f) => f.multiple == true)
      ? true
      : fieldsData.every((f) => f.multiple == false)
      ? false
      : null;

    if (isMultiple == null) {
      throw new CustomError(
        400,
        'The value of the multiple field is not the same.',
      );
    }
    if (isMultiple) {
      await new Promise<void>((resolve, reject) =>
        multer({
          ...this.options,
          storage: diskStorage({
            destination: dst,
            filename: addRandomStringToFileName,
          }),
          fileFilter: fileFilter(
            fieldsData.reduce((acc, cur) => {
              return [...acc, ...cur.extensions];
            }, []),
          ),
          limits: { fileSize: 1024 * 1024 * 50 },
        }).array('file')(ctx.getRequest(), ctx.getResponse(), (err: any) => {
          if (err) {
            const error = transformException(err);
            return reject(error);
          }
          resolve();
        }),
      );
    } else {
      const checkIsMultiple = await this.filesService.checkFieldsIsMultiple(
        processInstanceId,
        fieldNames,
      );
      // if (checkIsMultiple) {
      //   throw new CustomError(400, 'These fields are duplicated.');
      // }
      await new Promise<void>((resolve, reject) =>
        multer({
          ...this.options,
          storage: diskStorage({
            destination: dst,
            filename: addRandomStringToFileName,
          }),
          fileFilter: fileFilter(
            fieldsData.reduce((acc, cur) => {
              return [...acc, ...cur.extensions];
            }, []),
          ),
          limits: { fileSize: 1024 * 1024 * 50 },
        }).single('file')(ctx.getRequest(), ctx.getResponse(), (err: any) => {
          if (err) {
            const error = transformException(err);
            return reject(error);
          }
          resolve();
        }),
      );
    }

    return next.handle();
  }
}
