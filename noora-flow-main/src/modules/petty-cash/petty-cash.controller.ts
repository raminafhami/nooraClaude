import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseInterceptors,
  Res,
  StreamableFile,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { PettyCashService } from './petty-cash.service';
import { CheckPermissions } from '../iam/authentication/decorators/permissions.decorator';
import { PermissionAction, Subjects } from '../iam/authentication/enums';
import { CreatePettyCashDto } from './dto/create-petty-cash.dto';
import { ActiveUser } from '../iam/authentication/decorators/active-user.decorator';
import { ActiveUserData } from '../iam/authentication/interfaces/active-user-data.interface';
import * as fs from 'fs';
import CustomError from 'src/common/providers/custom-error';
import { Response } from 'express';
import { PettyCashFileInterceptor } from './interceptors/petty-cash-file.interceptor';
import { UpdatePettyCashDto } from './dto/update-petty-cash.dto';
import { DownloadTypes } from 'src/common/const/enums';
import { generateExcel } from '../files/file.utils';
import { GetQueryWithDownloadDto } from 'src/shared/crud/dto/get-query.dto';
import { Pagination } from './dto/get-petty-cash.dto';

@ApiTags('petty-cash')
@ApiBearerAuth('token')
@Controller('petty-cash')
export class PettyCashController {
  constructor(private readonly pettyCashService: PettyCashService) {}

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.PETTY_CASH,
  })
  @Post()
  async create(@Body() createPettyCashDto: CreatePettyCashDto) {
    return await this.pettyCashService.createPettyCash(createPettyCashDto);
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.PETTY_CASH,
  })
  @Get()
  @ApiQuery({
    name: 'download',
    required: false,
    enum: DownloadTypes,
    description: 'The format for downloading pettyCash (EXCEL)',
  })
  async getPettyCash(
    @Query() queryDto: GetQueryWithDownloadDto,
    @ActiveUser() activeUser: ActiveUserData,
    @Res({ passthrough: true }) res: Response,
  ) {
    let filters = JSON.parse(queryDto?.filters || '{}');

    if (filters.$and) {
      filters.$and.push({ isActive: true });
    } else {
      filters.$and = [{ isActive: true }];
    }
    if (
      !activeUser.groups.includes('ceo') &&
      !activeUser.groups.includes('system-admin') &&
      !activeUser.groups.includes('financial-expert')
    ) {
      if (filters.$and) {
        filters.$and.push({ userId: activeUser.id });
      } else {
        filters.$and = [{ userId: activeUser.id }];
      }
    }
    queryDto.populate = queryDto.download
      ? 'categoryIds userId'
      : (queryDto.populate ? queryDto.populate + ' ' : '') + 'categoryIds';

    queryDto.page = queryDto.download ? null : queryDto.page;
    queryDto.size = queryDto.download ? null : queryDto.size;

    queryDto.filters = JSON.stringify(filters);
    const pettyCash = await this.pettyCashService.findAll(queryDto);
    const count = await this.pettyCashService.count(
      JSON.parse(queryDto.filters),
    );

    pettyCash.data = pettyCash.data.map((entry: any) => {
      const clean = entry.toObject?.() ?? entry;
      clean.categoryIds = clean.categoryIds.filter(
        (cat: any) => !cat.isDeleted,
      );
      return clean;
    });
    const pettyCashData: any = pettyCash.data;
    let flattenedData = [];
    let row: number = 1;
    switch (queryDto.download) {
      case DownloadTypes.Excel: {
        for (let i = 0; i < pettyCashData.length; i++) {
          flattenedData.push({
            row: row++,
            title: pettyCashData[i].title,
            user: `${pettyCashData[i].userId.name} ${pettyCashData[i].userId.lastname}`,
            amount: pettyCashData[i].amount,
            remain: pettyCashData[i].remain,
            description: pettyCashData[i].description,
            categoryTitles: pettyCashData[i].categoryIds
              .map((item) => item.title)
              .join('-'),
            categoryCodes: pettyCashData[i].categoryIds
              .map((item) => item.code)
              .join('-'),
            isActive: pettyCashData[i].isActive === true ? 'فعال' : 'غیرفعال',
          });
        }

        const excel = await generateExcel(
          [
            'ردیف',
            'عنوان تنخواه',
            'کاربر',
            'تنخواه تخصیص داده شده',
            'باقی مانده از تنخواه',
            'توضیحات',
            'نام مراکز هزینه',
            'کد مراکز هزینه',
            'فعال بودن',
          ],
          flattenedData,
          'pettyCashes',
          [],
          ['تنخواه تخصیص داده شده', 'باقی مانده از تنخواه'],
        );

        res.setHeader(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=pettyCashes.xlsx`,
        );

        return new StreamableFile(excel);
      }
    }
    return {
      data: pettyCash.data,
      count,
    };
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.PETTY_CASH,
  })
  @Get('my-petty-cash-categories')
  async getCategoriesFromPettyCash(@ActiveUser() activeUser: ActiveUserData) {
    return await this.pettyCashService.getCategoriesFromPettyCash(
      activeUser.id,
    );
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.PETTY_CASH,
  })
  @Get('categories-of-user/:userId')
  async getCategoriesOfUser(
    @Param('userId') userId: string,
    @Query() paginationDto: Pagination,
  ) {
    return await this.pettyCashService.getCategoriesOfUser(
      userId,
      paginationDto,
    );
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.PETTY_CASH,
  })
  @Get('user/users-of-category/:categoryId')
  async getUsersOfCategory(
    @Param('categoryId') categoryId: string,
    @Query() paginationDto: Pagination,
  ) {
    return await this.pettyCashService.getUsersOfCategory(
      categoryId,
      paginationDto,
    );
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.PETTY_CASH,
  })
  @Put('deactivate/:id')
  async deActivePettyCash(@Param('id') id: string) {
    return await this.pettyCashService.updateById(id, { isActive: false });
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.PETTY_CASH,
  })
  @Put(':cashId')
  async updatePettyCash(
    @Param('cashId') cashId: string,
    @Body() updateDto: UpdatePettyCashDto,
  ) {
    return await this.pettyCashService.updatePettyCash(cashId, updateDto);
  }

  @CheckPermissions({
    action: PermissionAction.DELETE,
    subject: Subjects.PETTY_CASH,
  })
  @Delete(':id')
  async deletePettyCash(@Param('id') id: string) {
    return await this.pettyCashService.deletePettyCash(id);
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
        files: {
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
  @Post('upload/:cashId')
  @UseInterceptors(PettyCashFileInterceptor)
  async uploadFile(
    @ActiveUser() activeUser: ActiveUserData,
    @UploadedFiles() files,
    @Param('cashId') cashId: string,
  ) {
    const cash = await this.pettyCashService.findOne({ _id: cashId });
    const filePaths = files.map(
      (file) => `${file.destination}/${file.filename}`,
    );
    if (!cash) {
      const unlinkPromises = filePaths.map((filePath) =>
        fs.promises.unlink(filePath),
      );
      await Promise.all(unlinkPromises);
      throw new CustomError(HttpStatus.NOT_FOUND, 'pettyCash not found');
    }
    if (cash.userId != activeUser.id) {
      const unlinkPromises = filePaths.map((filePath) =>
        fs.promises.unlink(filePath),
      );
      await Promise.all(unlinkPromises);
      throw new ForbiddenException('You are not able to modify this cash');
    }
    const updatedFileList = (cash.files || []).concat(filePaths);
    return await this.pettyCashService.findOneAndUpdate(
      { _id: cashId },
      { $set: { files: updatedFileList } },
    );
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.FILE,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
        },
      },
      required: ['filePath'],
    },
  })
  @ApiBearerAuth('token')
  @Post('get-file')
  async getFile(@Body() body: { filePath: string }, @Res() res: Response) {
    return res.download(body.filePath);
  }

  @CheckPermissions({
    action: PermissionAction.DELETE,
    subject: Subjects.FILE,
  })
  @ApiBearerAuth('token')
  @Delete('delete-file/:cashId')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        filePath: { type: 'string' },
      },
      required: ['filePath'],
    },
  })
  async deleteFile(
    @ActiveUser() activeUser: ActiveUserData,
    @Param('cashId') cashId: string,
    @Body() body: { filePath: string },
  ) {
    const cash = await this.pettyCashService.findOne({ _id: cashId });
    if (!cash) {
      throw new CustomError(HttpStatus.NOT_FOUND, 'pettyCash not found');
    }
    if (cash.userId.toString() !== activeUser.id) {
      throw new ForbiddenException(
        'You are not authorized to modify this cost',
      );
    }

    if (!cash.files || !cash.files.includes(body.filePath)) {
      throw new CustomError(
        HttpStatus.BAD_REQUEST,
        'File not associated with this pettyCash',
      );
    }
    const updatedFiles = cash.files.filter((path) => path !== body.filePath);
    const updatedCash = await this.pettyCashService.findOneAndUpdate(
      { _id: cashId },
      { $set: { files: updatedFiles } },
    );
    try {
      await fs.promises.unlink(body.filePath);
    } catch (err) {
      console.warn(`File could not be deleted: ${body.filePath}`, err);
    }
    return updatedCash;
  }
}
