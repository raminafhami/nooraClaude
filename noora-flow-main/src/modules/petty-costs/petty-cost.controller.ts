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
  Res,
  StreamableFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CheckPermissions } from '../iam/authentication/decorators/permissions.decorator';
import { PermissionAction, Subjects } from '../iam/authentication/enums';
import { ActiveUser } from '../iam/authentication/decorators/active-user.decorator';
import { ActiveUserData } from '../iam/authentication/interfaces/active-user-data.interface';
import { PettyCostService } from './petty-cost.service';
import { CreatePettyCostDto } from './dto/create-petty-cost.dto';
import { GetQueryWithDownloadDto } from '../process-instances/dtos';
import { PettyCostFileInterceptor } from './interceptors/petty-cost-file.interceptor';
import * as fs from 'fs';
import { Response } from 'express';
import CustomError from 'src/common/providers/custom-error';
import {
  UpdatePettyCostStatusDto,
  UpdateUnofficialPettyCostDateDto,
  UpdateUnofficialPettyCostDto,
} from './dto/update-petty-cost.dto';
import { DownloadTypes } from 'src/common/const/enums';
import { generateExcel } from '../files/file.utils';
import { I18nService } from 'nestjs-i18n';
import { gregorianToJalaali } from 'src/common/providers/moment-date';
import { DeleteUnofficialCostDto } from './dto/delete-petty-cost.dto';
@ApiTags('petty-cost')
@ApiBearerAuth('token')
@Controller('petty-cost')
export class PettyCostController {
  constructor(
    private readonly pettyCostService: PettyCostService,
    private readonly i18nService: I18nService,
  ) {}

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.PETTY_COST,
  })
  @Post()
  async create(
    @Body() createPettyCost: CreatePettyCostDto,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return await this.pettyCostService.createPettyCost(
      createPettyCost,
      activeUser,
    );
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.PETTY_COST,
  })
  @Get()
  @ApiQuery({
    name: 'download',
    required: false,
    enum: DownloadTypes,
    description: 'The format for downloading pettyCost (EXCEL)',
  })
  async getPettyCost(
    @Query() queryDto: GetQueryWithDownloadDto,
    @ActiveUser() activeUser: ActiveUserData,
    @Res({ passthrough: true }) res: Response,
  ) {
    let filters = JSON.parse(queryDto?.filters || '{}');
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
      ? 'categoryId userId categoryBudgetId'
      : queryDto.populate;

    queryDto.page = queryDto.download ? null : queryDto.page;
    queryDto.size = queryDto.download ? null : queryDto.size;
    queryDto.filters = JSON.stringify(filters);
    const pettyCost = await this.pettyCostService.findAll(queryDto);
    const count = await this.pettyCostService.count(
      JSON.parse(queryDto.filters),
    );
    const pettyCostData: any = pettyCost.data;
    let flattenedData = [];
    let row: number = 1;
    switch (queryDto.download) {
      case DownloadTypes.Excel: {
        for (let i = 0; i < pettyCostData.length; i++) {
          flattenedData.push({
            row: row++,
            user: `${pettyCostData[i].userId.name} ${pettyCostData[i].userId.lastname}`,
            categoryBudgetTitle: pettyCostData[i].categoryBudgetId?.name,
            categoryBudgetDateFrom: pettyCostData[i].categoryBudgetId?.dateFrom
              ? gregorianToJalaali(
                  (pettyCostData[i].categoryBudgetId?.dateFrom).toISOString(),
                )
              : '',
            categoryBudgetDateTo: pettyCostData[i].categoryBudgetId?.dateTo
              ? gregorianToJalaali(
                  (pettyCostData[i].categoryBudgetId?.dateTo).toISOString(),
                )
              : '',
            category: pettyCostData[i].categoryId
              ? `${pettyCostData[i].categoryId?.title} ${pettyCostData[i].categoryId?.code}`
              : '',
            currency: this.i18nService.translate(
              `common.${pettyCostData[i]?.currency}`,
              { lang: 'fa' },
            ),
            currencyRate: pettyCostData[i].currencyRate,
            total: pettyCostData[i].total,
            amount: pettyCostData[i].amount,
            vat: pettyCostData[i].vat,
            totalWithVat: pettyCostData[i].vat + pettyCostData[i].total,
            spentDate: pettyCostData[i].spentDate
              ? gregorianToJalaali(pettyCostData[i].spentDate.toISOString())
              : '',
            description: pettyCostData[i].description,
            status: this.i18nService.translate(
              `common.${pettyCostData[i]?.status}`,
              { lang: 'fa' },
            ),
          });
        }

        const excel = await generateExcel(
          [
            'ردیف',
            'کاربر',
            'عنوان بودجه',
            'اعتبار بودجه از تاریخ',
            'اعتبار بودجه تا تاریخ',
            'مرکز هزینه',
            'ارز',
            'نرخ ارز',
            'مبلغ پایه',
            'مجموع',
            'ارزش افزوده',
            'هزینه با ارزش افزوده',
            'تاریخ خرید',
            'توضیحات',
            'وضعیت',
          ],
          flattenedData,
          'pettyCashes',
          [],
          ['مبلغ پایه', 'مجموع', 'ارزش افزوده', 'هزینه با ارزش افزوده'],
        );

        res.setHeader(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=pettyCosts.xlsx`,
        );

        return new StreamableFile(excel);
      }
    }
    return {
      data: pettyCost.data,
      count,
    };
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.PETTY_COST,
  })
  @Put('status')
  async updateCostsStatus(@Body() updateDto: UpdatePettyCostStatusDto) {
    return await this.pettyCostService.updateCostsStatus(updateDto);
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.PETTY_COST,
  })
  @Put('unofficial/:costId')
  async updateUnofficialCost(
    @Param('costId') costId: string,
    @Body() updateDto: UpdateUnofficialPettyCostDto,
  ) {
    return await this.pettyCostService.updateUnofficialPettyCost(
      costId,
      updateDto,
    );
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.PETTY_COST,
  })
  @Put('update/unofficial/spent-date')
  async updateSpentDate(@Body() updateDto: UpdateUnofficialPettyCostDateDto) {
    return await this.pettyCostService.updateSpentDate(updateDto);
  }

  @CheckPermissions({
    action: PermissionAction.DELETE,
    subject: Subjects.PETTY_COST,
  })
  @Delete(':costId')
  async delete(
    @Param('costId') costId: string,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return await this.pettyCostService.deletePettyCost(costId, activeUser);
  }

  @CheckPermissions({
    action: PermissionAction.DELETE,
    subject: Subjects.PETTY_COST,
  })
  @Delete('batch/unofficial-costs')
  async deleteUnofficialCost(@Body() deleteCostDto: DeleteUnofficialCostDto) {
    return await this.pettyCostService.deleteUnofficialCost(deleteCostDto);
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
  @Post('upload/:costId')
  @UseInterceptors(PettyCostFileInterceptor)
  async uploadFile(
    @ActiveUser() activeUser: ActiveUserData,
    @UploadedFiles() files,
    @Param('costId') costId: string,
  ) {
    const cost = await this.pettyCostService.findOne({ _id: costId });
    const filePaths = files.map(
      (file) => `${file.destination}/${file.filename}`,
    );
    if (!cost) {
      const unlinkPromises = filePaths.map((filePath) =>
        fs.promises.unlink(filePath),
      );
      await Promise.all(unlinkPromises);
      throw new CustomError(HttpStatus.NOT_FOUND, 'Cost does not exist');
    }
    if (cost.userId != activeUser.id) {
      const unlinkPromises = filePaths.map((filePath) =>
        fs.promises.unlink(filePath),
      );
      await Promise.all(unlinkPromises);
      throw new ForbiddenException('You are not able to modify this cost');
    }
    const updatedFileList = (cost.files || []).concat(filePaths);
    return await this.pettyCostService.findOneAndUpdate(
      { _id: costId },
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
  @Delete('delete-file/:costId')
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
    @Param('costId') costId: string,
    @Body() body: { filePath: string },
  ) {
    const cost = await this.pettyCostService.findOne({ _id: costId });
    if (!cost) {
      throw new CustomError(HttpStatus.NOT_FOUND, 'Cost not found');
    }
    if (cost.userId.toString() !== activeUser.id) {
      throw new ForbiddenException(
        'You are not authorized to modify this cost',
      );
    }

    if (!cost.files || !cost.files.includes(body.filePath)) {
      throw new CustomError(
        HttpStatus.BAD_REQUEST,
        'File not associated with this cost',
      );
    }
    const updatedFiles = cost.files.filter((path) => path !== body.filePath);
    const updatedCost = await this.pettyCostService.findOneAndUpdate(
      { _id: costId },
      { $set: { files: updatedFiles } },
    );
    try {
      await fs.promises.unlink(body.filePath);
    } catch (err) {
      console.warn(`File could not be deleted: ${body.filePath}`, err);
    }
    return updatedCost;
  }
}
