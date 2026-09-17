import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  Query,
  Put,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { InspectionCostsService } from './inspection-costs.service';
import { CreateInspectionCostDto } from './dto/create-inspection-cost.dto';
import {
  UpdateInspectionCostDto,
  UpdateInspectionCostTotalDto,
} from './dto/update-inspection-cost.dto';
import {
  GetQueryDto,
  GetQueryWithDownloadDto,
} from 'src/shared/crud/dto/get-query.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CheckPermissions } from '../iam/authentication/decorators/permissions.decorator';
import { PermissionAction, Subjects } from '../iam/authentication/enums';
import { PopulateQueryDto } from 'src/shared/crud/dto/populate-query.dto';
import { UpdateInspectionCostCaseStatusDto } from './dto/update-inspection-cost-status.dto';
import {
  UpdateInspectionCostPaymentDto,
  UpdateInspectionCostPaymentVoucherDto,
} from './dto/update-inspection-cost-payment.dto';
import {
  InspectionCostDocument,
  InspectionCostStatus,
} from './schemas/inspection-cost.schema';
import { UpdateInspectionCostsDto } from './dto/update-inspection-costs.dto';
import { extractDistinctValues } from 'src/common/utils/data.util';
import { generateExcel } from '../files/file.utils';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { CategoryService } from '../categories/category.service';
import { CategoryBudgetService } from '../category-budget/category-budget.service';

@ApiBearerAuth('token')
@ApiTags('inspection-costs')
@Controller('inspection-costs')
export class InspectionCostsController {
  constructor(
    private readonly inspectionCostsService: InspectionCostsService,
    private readonly i18nService: I18nService,
    private readonly categoryBudgetService: CategoryBudgetService,
  ) {}

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.INSPECTION_COST,
  })
  @Post()
  async create(@Body() createInspectionCostDto: CreateInspectionCostDto) {
    const now = new Date();
    now.setMilliseconds(0);
    // const categoryBudget =
    //   await this.categoryBudgetService.validateCategoryBudget(
    //     createInspectionCostDto.categoryId,
    //     now.toISOString(),
    //   );
    const inspectionCosts: InspectionCostDocument =
      await this.inspectionCostsService.create({
        ...createInspectionCostDto,
        // categoryBudgetId: categoryBudget.id,
      });

    await this.inspectionCostsService.updateCosts(inspectionCosts.caseId);

    return inspectionCosts;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.INSPECTION_COST,
  })
  @Get()
  async findAll(@Query() queryDto: GetQueryDto) {
    const data = await this.inspectionCostsService.getInspections(queryDto);
    // const data = await this.inspectionCostsService.findAll(queryDto);
    return data;
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.INSPECTION_COST,
  })
  @Patch('total')
  async updateTotalBatch(@Body() totalData: UpdateInspectionCostTotalDto) {
    await this.inspectionCostsService.bulkUpdate(totalData.data);
    return { success: true };
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.INSPECTION_COST,
  })
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Query() { populate }: PopulateQueryDto,
  ) {
    const inspectionCosts = await this.inspectionCostsService.findById(
      id,
      populate,
    );
    if (!inspectionCosts) {
      throw new NotFoundException('inspection-costs not exist');
    }
    return inspectionCosts;
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.INSPECTION_COST,
  })
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateInspectionCostDto: UpdateInspectionCostDto,
  ) {
    const newInspectionCosts =
      await this.inspectionCostsService.findByIdAndUpdate(
        id,
        updateInspectionCostDto,
      );
    if (!newInspectionCosts) {
      throw new NotFoundException('inspection-costs not exist');
    }
    await this.inspectionCostsService.updateCosts(newInspectionCosts.caseId);
    return newInspectionCosts;
  }

  @CheckPermissions({
    action: PermissionAction.DELETE,
    subject: Subjects.INSPECTION_COST,
  })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.inspectionCostsService.delete(id);
  }

  @Patch('case/update-costs-many')
  async updateManyCosts(
    @Body() updateInspectionCostsDto: UpdateInspectionCostsDto,
  ) {
    const { inspectionCostIds, currency, currencyRate } =
      updateInspectionCostsDto;
    await this.inspectionCostsService.updateMany(
      {
        _id: { $in: inspectionCostIds },
      },
      { currency, currencyRate },
    );
    const inspectionCosts =
      await this.inspectionCostsService.findWithOutPagination({
        _id: { $in: inspectionCostIds },
      });
    if (inspectionCosts.length === 0) {
      throw new NotFoundException('Inspection cost not found');
    }

    const distinctCaseIds = extractDistinctValues(inspectionCosts, 'caseId');
    let result: InspectionCostDocument[] = [];
    for (let caseId of distinctCaseIds) {
      result.push(
        ...(await this.inspectionCostsService.updateCosts(
          caseId,
          inspectionCostIds,
        )),
      );
    }
    return result;
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.INSPECTION_COST,
  })
  @Patch('case/:caseId')
  async updateStatuses(
    @Param('caseId') caseId: string,
    @Body() { caseStatus }: UpdateInspectionCostCaseStatusDto,
  ) {
    await this.inspectionCostsService.updateMany(
      {
        caseId,
      },
      { caseStatus },
    );
  }

  @CheckPermissions({
    action: PermissionAction.DELETE,
    subject: Subjects.INSPECTION_COST,
  })
  @Delete('case/:caseId')
  async deleteInspectionCostByCaseId(@Param('caseId') caseId: string) {
    return this.inspectionCostsService.deleteInspectionCostByCaseId(caseId);
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.INSPECTION_COST,
  })
  @Post('payments')
  async updatePayment(
    @Body() updateInspectionCostPaymentDto: UpdateInspectionCostPaymentDto,
  ) {
    await this.inspectionCostsService.updateMany(
      {
        _id: { $in: updateInspectionCostPaymentDto.ids },
      },
      {
        payment: {
          caseId: updateInspectionCostPaymentDto.caseId,
          caseNo: updateInspectionCostPaymentDto.caseNo,
        },
        status: InspectionCostStatus.PENDING,
      },
    );

    return 'updated successfully';
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.INSPECTION_COST,
  })
  @Post('payments/vouchers')
  async updatePaymentVouchers(
    @Body()
    updateInspectionCostPaymentVoucherDto: UpdateInspectionCostPaymentVoucherDto,
  ) {
    await this.inspectionCostsService.bulkUpdatePaymentVoucher(
      updateInspectionCostPaymentVoucherDto.data,
    );

    return 'updated successfully';
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.INSPECTION_COST,
  })
  @Patch('payments/:caseId/cancel')
  async cancelPaymentByCaseId(@Param('caseId') caseId: string) {
    await this.inspectionCostsService.updateMany(
      {
        'payment.caseId': caseId,
      },
      {
        payment: null,
        status: InspectionCostStatus.UNPAID,
      },
    );

    return 'updated successfully';
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.INSPECTION_COST,
  })
  @Get('payments/:caseId')
  async readPaymentByCaseId(
    @Param('caseId') caseId: string,
    @Query() queryDto: GetQueryWithDownloadDto,
    @Res() res: Response,
  ) {
    const filter = JSON.parse(queryDto.filters || '{}');
    filter['payment.caseId'] = caseId;
    queryDto.filters = JSON.stringify(filter);

    if (queryDto.download === '1') {
      let row = 1;
      queryDto.page = null;
      queryDto.size = null;
      const { data } = await this.inspectionCostsService.findAll(queryDto);

      const flattenedData = [
        ...data.map((ic) => {
          return {
            row: row++,
            personName: ic.personName,
            title: ic.title.split(':')[0],
            total: ic.total != undefined ? parseFloat(ic.total) : null,
            currency: `${this.i18nService.translate(`common.${ic?.currency}`, {
              lang: 'fa',
            })} ${ic.currencyRate} `,
            caseNo: ic.caseNo,
            instance: ic['instance']?.name,
            instanceStatus: this.i18nService.translate(
              `common.${ic['instance']?.status}`,
              { lang: 'fa' },
            ),
            buyer: ic['instance']?.parameters?.Buyer?.name,
          };
        }),
      ];

      const excel = generateExcel(
        [
          'ردیف',
          'ذینفع',
          'دسته بندی',
          'مبلغ',
          'نرخ پیشنهادی',
          'شماره درخواست',
          'نوع بازرسی',
          'وضعیت درخواست',
          'خریدار',
        ],
        flattenedData,
        'inspectionCost',
        [],
        ['مبلغ'],
      );

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=inspectionCost.xlsx`,
      );

      return res.end(excel);
    }

    const data = await this.inspectionCostsService.findAll(queryDto);
    res.json({
      result: {
        data: data.data,
        count: data.count,
      },
    });
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.INSPECTION_COST,
  })
  @Patch('case/update-costs/:caseId')
  async updateTotalCosts(@Param('caseId') caseId: string) {
    return await this.inspectionCostsService.updateCosts(caseId);
  }

  @Post('/update/currecyrate/update/cu')
  async updateCurrenciesTemp() {
    return this.inspectionCostsService.updateC();
  }
}
