import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FilesService } from './files.service';
import { FileUploadInterceptor } from './interceptors/file-upload.interceptor';
import {
  ExportPdfFromKeyDto,
  ExportPdfFromVariablesDto,
} from './dto/export-pdf.dto';
import * as ejs from 'ejs';
import * as fs from 'fs/promises';
import { existsSync } from 'fs';
import { DocumentQueryDto, ExportQueryDto } from './dto/file-query.dto';
import { generatePdfStream } from './file.utils';
import type { Response } from 'express';
import CustomError from 'src/common/providers/custom-error';
import CustomResponse from 'src/common/providers/custom-response.service';
import { ProcessInstanceService } from '../process-instances/process-instances.service';
import { ActiveUser } from '../iam/authentication/decorators/active-user.decorator';
import { ActiveUserData } from '../iam/authentication/interfaces/active-user-data.interface';
import { CustomMessages } from 'src/common/const/custom-messages';
import { InspectionFileDto } from './dto/inspection-file.dto';
import { InspectionFileInterceptor } from './interceptors/inspection-file.interceptor';
import { TransferFileDto } from './dto/transfer-file.dto';
import * as path from 'path';
import { CheckPermissions } from '../iam/authentication/decorators/permissions.decorator';
import { PermissionAction, Subjects } from '../iam/authentication/enums';

export class HtmlResponse {
  html: string;
  constructor(data: string) {
    this.html = data;
  }
}
@ApiTags('files')
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly processInstanceService: ProcessInstanceService,
  ) {}

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.FILE,
  })
  @ApiBearerAuth('token')
  @Get(':fileId')
  async getFile(
    @ActiveUser() user: ActiveUserData,
    @Param('fileId') fileId: string,
    @Res() res: Response,
  ) {
    const file = await this.filesService.getFile(fileId);
    return res.download(file.path);
  }

  @CheckPermissions({
    action: PermissionAction.DELETE,
    subject: Subjects.FILE,
  })
  @ApiBearerAuth('token')
  @Delete(':fileId')
  async deleteFile(
    @ActiveUser() user: ActiveUserData,
    @Param('fileId') fileId: string,
  ) {
    await this.filesService.deleteFile(fileId);
    return new CustomResponse(200, CustomMessages.SUCCESS);
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.FILE,
  })
  @ApiBearerAuth('token')
  @Get(':processInstanceId/documents')
  async getInstanceDocuments(
    @ActiveUser() user: ActiveUserData,
    @Param('processInstanceId') processInstanceId: string,
    @Query() query: DocumentQueryDto,
  ) {
    const files = await this.filesService.getInstanceDocuments(
      processInstanceId,
      query?.fieldNames,
    );
    return new CustomResponse(201, 'file successfully retrieved.', {
      files,
    });
  }

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.FILE,
  })
  @ApiBearerAuth('token')
  @Post('instances/transfer')
  async transferFiles(
    @ActiveUser() user: ActiveUserData,
    @Body() transferFileDto: TransferFileDto,
  ) {
    const files = await this.filesService.getInstanceDocumentsWithFilter({
      processInstanceId: transferFileDto.sourceInstanceId,
      fieldNames: {
        $in: transferFileDto.files.map((f) => f.sourceFieldName),
      },
    });
    if (files.length == 0) {
      return [];
    }
    const destinationInstance = await this.processInstanceService.findOne(
      transferFileDto.destinationInstanceId,
      [],
    );
    // const destinationFieldNames = transferFileDto.files.map(
    //   (f) => f.destinationFieldName,
    // );
    // const fieldsData = transferFileDto.files
    //   .map((f) => f.destinationFieldName)
    //   .map((name) => destinationInstance.documents.types[name])
    //   .filter((data) => !!data);
    // if (fieldsData.length != destinationFieldNames.length)
    //   throw new CustomError(400, 'fieldsName not exist.');

    let filesToBeSaved = await Promise.all(
      transferFileDto.files.map(async (f) => {
        const selectedFile = files.find((sf) =>
          sf.fieldNames.includes(f.sourceFieldName),
        );
        if (!selectedFile) return null;
        const dst = `./documents/${destinationInstance.id}/${f.destinationFolder}`;
        if (!existsSync(dst)) {
          await fs.mkdir(dst, { recursive: true });
        }
        const dstPath = path.join(dst, selectedFile.filename);

        await fs.copyFile(selectedFile.path, dstPath);
        return {
          processInstanceId: transferFileDto.destinationInstanceId,
          owner: user.id,
          fieldNames: [f.destinationFieldName],
          directory: dst,
          mimetype: selectedFile.mimetype,
          filename: selectedFile.filename,
          path: dstPath,
        };
      }),
    );
    filesToBeSaved = filesToBeSaved
      .filter((f) => !!f)
      .reduce((acc: any, cur) => {
        const index = acc.findIndex((ff) => ff.path == cur.path);
        if (index != -1) {
          acc[index].fieldNames = cur.fieldNames.concat(acc[index].fieldNames);
        } else {
          acc.push(cur);
        }
        return acc;
      }, []);
    const savedFiles = await this.filesService.createBatchFile(filesToBeSaved);
    return savedFiles;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.FILE,
  })
  @ApiBearerAuth('token')
  @Get(':processInstanceId/documents-definition')
  async getFilesDefinition(
    // @ActiveUser() user: ActiveUserData,
    @Param('processInstanceId') processInstanceId: string,
  ) {
    const instance = await this.processInstanceService.findOne(
      processInstanceId,
      [],
    );
    return new CustomResponse(
      201,
      'file successfully retrieved.',
      instance.documents,
    );
  }

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.FILE,
  })
  @ApiBearerAuth('token')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  @Post(':processInstanceId/upload/:fieldNames/:folder')
  @UseInterceptors(FileUploadInterceptor)
  async uploadFile(
    @ActiveUser() user: ActiveUserData,
    @Req() req,
    @Param('processInstanceId') processInstanceId: string,
    @Param('fieldNames') fieldNames: string,
    @Param('folder') folder: string,
  ): Promise<CustomResponse | CustomError> {
    const _files = req.files || [req.file];
    const files = await Promise.all(
      _files.map((f) => {
        return this.filesService.create({
          processInstanceId: processInstanceId,
          fieldNames: fieldNames.split(','),
          owner: user.id,
          directory: f.destination,
          filename: f.filename,
          mimetype: f.mimetype,
          path: f.path,
          access: null,
        });
      }),
    );
    return new CustomResponse(201, 'file successfully uploaded.', files);
  }

  @Get(':processInstanceId/export/:taskKeys')
  async exportToPdf(
    @Res({ passthrough: true }) res: Response,
    @Param() subFormDto: ExportPdfFromKeyDto,
    @Query() queryParam: ExportQueryDto,
  ) {
    if (!queryParam.template) {
      return '';
    }
    const taskData = await this.processInstanceService.getFormValues(
      subFormDto.processInstanceId,
      subFormDto.taskKeys.split(','),
    );
    const template = await fs.readFile(
      `./assets/templates/${queryParam.template}`,
      'utf8',
    );
    const html = ejs.compile(template)(taskData);
    if (queryParam.download == '1') {
      const file = (await generatePdfStream(html)) as any;
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="file.pdf"',
      });
      return new StreamableFile(file);
    } else {
      return html;
    }
  }

  @Get(':processInstanceId/export/vars/:variables')
  async exportToPdfFromVariables(
    @Res({ passthrough: true }) res: Response,
    @Param() variableDto: ExportPdfFromVariablesDto,
    @Query() queryParam: ExportQueryDto,
  ) {
    if (!queryParam.template) {
      return '';
    }
    const variablesData = await this.processInstanceService.getVariables(
      variableDto.processInstanceId,
      variableDto.variables.split(','),
    );
    const template = await fs.readFile(
      `./assets/templates/${queryParam.template}`,
      'utf8',
    );
    const html = ejs.compile(template)(variablesData);
    if (queryParam.download == '1') {
      const file = (await generatePdfStream(html)) as any;
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="file.pdf"',
      });
      return new StreamableFile(file);
    } else {
      return new HtmlResponse(html);
    }
  }

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.FILE,
  })
  @ApiBearerAuth('token')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        category: {
          type: 'string',
          format: 'string',
        },
        description: {
          type: 'string',
          format: 'string',
        },
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  @Post('inspection/:processInstanceId/upload')
  @UseInterceptors(InspectionFileInterceptor)
  async uploadInspectionFile(
    @ActiveUser() user: ActiveUserData,
    @Req() req,
    @Param('processInstanceId') processInstanceId: string,
    @Body() inspectionFileDto: InspectionFileDto,
  ): Promise<CustomResponse | CustomError> {
    const _files = req.files || [req.file];
    const result = await Promise.all(
      _files.map((f) => {
        return this.filesService.createInspectionFile({
          processInstanceId: processInstanceId,
          directory: f.destination,
          filename: f.filename,
          mimetype: f.mimetype,
          path: f.path,
          ...inspectionFileDto,
        });
      }),
    );

    return new CustomResponse(201, 'files successfully uploaded.', result);
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.FILE,
  })
  @ApiBearerAuth('token')
  @Get('inspection/:processInstanceId/files')
  async getInstanceInspectionFiles(
    @ActiveUser() user: ActiveUserData,
    @Param('processInstanceId') processInstanceId: string,
  ) {
    const files = await this.filesService.getInstanceInspectionFiles(
      processInstanceId,
    );
    return new CustomResponse(201, 'file successfully retrieved.', {
      files,
    });
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.FILE,
  })
  @ApiBearerAuth('token')
  @Get('inspection/:fileId')
  async getInspectionFile(
    @ActiveUser() user: ActiveUserData,
    @Param('fileId') fileId: string,
    @Res() res: Response,
  ) {
    const file = await this.filesService.getInspectionFile(fileId);
    return res.download(file.path);
  }

  @CheckPermissions({
    action: PermissionAction.DELETE,
    subject: Subjects.FILE,
  })
  @ApiBearerAuth('token')
  @Delete('inspection/:fileId')
  async deleteInspectionFile(
    @ActiveUser() user: ActiveUserData,
    @Param('fileId') fileId: string,
  ) {
    await this.filesService.deleteInspectionFile(fileId);
    return new CustomResponse(200, CustomMessages.SUCCESS);
  }
}
