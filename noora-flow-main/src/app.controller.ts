import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
  OnModuleInit,
  BadRequestException,
} from '@nestjs/common';
import { AppService } from './app.service';
import { ApiConsumes, ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import * as fs from 'fs/promises';
import * as ejs from 'ejs';
import { generatePdfStream } from './modules/files/file.utils';
import { Response } from 'express';
import { HtmlResponse } from './modules/files/files.controller';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { SeederService } from './modules/seeders/seeder.service';
import { InjectConnection } from '@nestjs/mongoose';
import mongoose, { Connection } from 'mongoose';
import { FilesService } from './modules/files/files.service';
import { ProjectTaskService } from './modules/project-task/project-task.service';
import { ProjectService } from './modules/project/project.service';
import { ProcessInstanceService } from './modules/process-instances/process-instances.service';

class TemplateDto {
  @ApiProperty()
  @IsNotEmpty()
  templateName: string;

  @ApiProperty()
  @IsNotEmpty()
  outputFileName: string;

  @ApiProperty()
  @IsOptional()
  data: any;

  @ApiProperty()
  @IsBoolean()
  download: boolean;
}

class UploadTemplateDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  path: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly seederService: SeederService,
    private readonly inspectionFile: FilesService,
    private readonly projectTaskService: ProjectTaskService,
    private readonly projectService: ProjectService,
    private readonly processInstanceService: ProcessInstanceService,
  ) {}

  // @Post('sms')
  // async sendMessage(@Body() messageDate: CreateMessageDto) {
  //   const result = await firstValueFrom(
  //     this.httpService.request({
  //       method: 'post',
  //       url: 'https://api.sms.ir/v1/send/bulk',
  //       headers: {
  //         'X-API-KEY':
  //           'YKpcbBpImBHPEPjSJCSKsDIm1eOWUa3NZyfxSLuXYln3iy8dv3BmzbAzrv0HyA0j',
  //         'Content-Type': 'application/json',
  //       },
  //       data: {
  //         lineNumber: 100091304500,
  //         messageText: messageDate.text,
  //         mobiles: [messageDate.phoneNumber],
  //         sendDateTime: null,
  //       },
  //     }),
  //   );

  //   return result.data;
  // }

  @Post('template/generate')
  async exportToPdfFromVariables(
    @Res({ passthrough: true }) res: Response,
    @Body() templateDto: TemplateDto,
  ) {
    const template = await fs.readFile(
      `./assets/templates/${templateDto.templateName}`,
      'utf8',
    );
    const html = ejs.compile(template)(templateDto?.data);
    if (templateDto.download) {
      const file = (await generatePdfStream(html)) as any;
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${templateDto.outputFileName}.pdf"`,
      });
      return new StreamableFile(file);
    } else {
      return new HtmlResponse(html);
    }
  }

  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  @ApiConsumes('multipart/form-data')
  @Post('template/upload')
  async uploadTemplate(
    @Body() uploadTemplateDto: UploadTemplateDto,
    @UploadedFile() file: any,
  ) {
    await this.appService.saveBufferToFile(
      file.buffer,
      uploadTemplateDto.path,
      file.originalname,
    );
    return { isSuccess: true };
  }

  @Get('seeder')
  async runSeeder() {
    return await this.seederService.runSeeder();
  }

  @Post('inspection-files')
  async changeInspectionFileCategory() {
    const allInspectionFiles = await this.inspectionFile.findAllFile();

    const updatePromises = allInspectionFiles.map(async (element) => {
      const categoryParts = element.category.split(':');
      const baseCategory = categoryParts[0];

      switch (true) {
        case element.category === 'image' || element.category === 'video':
          element.category = `other:${element.category}`;
          break;

        case element.category === 'recordedVideoSeals':
          element.category = 'seals:video';
          break;

        case element.category === 'recordedVideoSample':
          element.category = 'sampling:video';
          break;

        case /:/.test(element.category) &&
          (baseCategory === 'packing' || baseCategory === 'inspection'):
          element.category = `appearanceAndPacking:${categoryParts[1]}`;
          break;
        case element.category === 'inspection':
          element.category = `appearanceAndPacking:image`;
          break;

        case element.category === 'appearenceAndPacking':
          element.category = 'appearanceAndPacking:image';
          break;

        case element.category === 'beforeLoading' ||
          element.category === 'whileLoading':
          element.category = 'loading:image';
          break;

        case /:/.test(element.category) &&
          (baseCategory === 'beforeLoading' || baseCategory === 'whileLoading'):
          element.category = `loading:${categoryParts[1]}`;
          break;

        case !/:/.test(element.category):
          element.category = `${element.category}:image`;
          break;

        default:
          // No action needed for unhandled categories
          break;
      }

      return await this.inspectionFile.updateFile(
        { _id: element._id },
        { category: element.category },
      );
    });

    await Promise.all(updatePromises);
  }
}
