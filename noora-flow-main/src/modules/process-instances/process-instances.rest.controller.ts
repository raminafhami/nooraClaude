import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  CreateProcessInstanceDto,
  GetProcessInstanceStatsQueryDto,
  GetQueryDto,
  UpdateProcessInstanceDto,
  UpdateProcessInstanceQueryDto,
  UpdateProcessWatcher,
  UpdateInstanceState,
  PropDto,
  UpdateInstancesDebt,
  GetQueryWithDownloadDto,
  DuplicateInstanceDto,
  CancelProcessInstanceDto,
} from './dtos';
import { ProcessInstanceService } from './process-instances.service';
import CustomError from 'src/common/providers/custom-error';
import CustomResponse from 'src/common/providers/custom-response.service';
import { ActiveUserData } from '../iam/authentication/interfaces/active-user-data.interface';
import { ActiveUser } from '../iam/authentication/decorators/active-user.decorator';
import { CustomMessages } from 'src/common/const/custom-messages';
import { PermissionAction, Subjects } from '../iam/authentication/enums';
import { CheckPermissions } from '../iam/authentication/decorators/permissions.decorator';
import { DebtService } from '../users/services/debt.service';
import { InstanceReportDto } from './dtos/instance-report.dto';
import { Response } from 'express';
import { gregorianDateTimeToJalali } from 'src/common/providers/moment-date';
import { I18nService } from 'nestjs-i18n';
import {
  generateExcel,
  generatePdfStream,
  generatePdfWithGoTo,
} from '../files/file.utils';
import { FilesService } from '../files/files.service';
import * as fs from 'fs/promises';
import * as ejs from 'ejs';
import { UserFilesService } from '../user-files/user-files.service';
import * as moment from 'moment-jalaali';
import { IncomeService } from '../income/income.service';
import { DownloadTypes, InvoicePaymentStatuses } from 'src/common/const/enums';
import {
  detectBankAccountName,
  detectGoodFieldByKey,
} from 'src/common/utils/utils';
import { ProcessInstanceDocument } from './schemas/process-instances.schema';
@ApiBearerAuth('token')
@ApiTags('Process Instances')
@Controller('process-instances')
export class ProcessInstanceController {
  constructor(
    private processInstanceService: ProcessInstanceService,
    private debtService: DebtService,
    private readonly i18nService: I18nService,
    private readonly filesService: FilesService,
    private readonly userFilesService: UserFilesService,
    private readonly incomeService: IncomeService,
  ) {}

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.PROCESS_INSTANCE,
  })
  @Get('file-summary')
  async processInstanceFileSummary(@Query() getQueryDto: GetQueryDto) {
    getQueryDto.filters = JSON.stringify(
      JSON.parse(getQueryDto.filters || '{}'),
    );

    const processInstance =
      await this.processInstanceService.processInstanceFileSummary(getQueryDto);
    return processInstance;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.PROCESS_INSTANCE,
  })
  @Get()
  async findInstances(
    @Query() getQueryDto: GetQueryWithDownloadDto,
    @Res() res: Response,
  ) {
    if (getQueryDto.download === '1') {
      getQueryDto.page = null;
      getQueryDto.size = null;
      let totalInspectionFeeInRial = 0;
      let row = 1;
      getQueryDto.props =
        'InspectionMethod,Buyer,Assignees.customer,CaseType,InvoiceTotal,CertificateIssueNo,LabName,GoodsDescriptions,InspectionFeeInRial,InvoicePaymentStatus,ProformaNo,BillOfLadingNo,InspectionInstanceId,GoodsField';
      const { data } = await this.processInstanceService.findAll(
        null,
        getQueryDto,
      );
      const flattenedData = [];
      const inspectionFilePromises = [];
      const filePromises = [];

      for (const pi of data) {
        totalInspectionFeeInRial += pi.parameters?.InspectionFeeInRial
          ? parseFloat(pi.parameters?.InspectionFeeInRial)
          : 0;
        inspectionFilePromises.push(
          this.filesService.getInstanceInspectionFiles(
            pi.parameters?.InspectionInstanceId,
          ),
        );
        filePromises.push(this.filesService.getInstanceFiles(pi.id));
      }
      const inspectionFilesResults = await Promise.all(inspectionFilePromises);
      const filesResults = await Promise.all(filePromises);

      for (let i = 0; i < data.length; i++) {
        const inspectionFile = inspectionFilesResults[i];
        const files = filesResults[i];

        const hasFile = !!(inspectionFile.length != 0 || files.length != 0)
          ? 'دارد'
          : 'ندارد';

        flattenedData.push({
          row: row++,
          caseNo: data[i].caseNo,
          certificateIssueNo: data[i].parameters?.CertificateIssueNo,
          inspectionType: this.i18nService.translate(
            `common.${data[i]?.processDefinitionKey}`,
            { lang: 'fa' },
          ),
          inspectionMethod: this.i18nService.translate(
            `common.${data[i]?.parameters?.InspectionMethod}`,
            { lang: 'fa' },
          ),
          buyerName: data[i].parameters?.Buyer?.name,
          customerName: data[i].parameters?.Assignees?.customer?.name,
          labName: data[i].parameters?.LabName,
          goodDescription: data[i].parameters?.GoodsDescriptions,
          proformaNo: data[i].parameters?.ProformaNo,
          blNo: data[i].parameters?.BillOfLadingNo,
          inspectionFeeInRial:
            data[i].parameters?.InspectionFeeInRial != undefined
              ? parseFloat(data[i].parameters?.InspectionFeeInRial)
              : null,
          caseType: this.i18nService.translate(
            `common.${data[i].parameters?.CaseType}`,
            { lang: 'fa' },
          ),
          invoicePaymentStatus: this.i18nService.translate(
            `common.${data[i].parameters?.InvoicePaymentStatus}`,
            { lang: 'fa' },
          ),
          state: this.i18nService.translate(`common.${data[i].status}`, {
            lang: 'fa',
          }),
          goodField: detectGoodFieldByKey(data[i].parameters?.GoodsField),
          hasFile,
          createdAt: gregorianDateTimeToJalali(data[i]['createdAt']),
        });
      }
      flattenedData.push({
        row: null,
        caseNo: null,
        certificateIssueNo: null,
        inspectionType: null,
        inspectionMethod: null,
        buyerName: null,
        customerName: null,
        labName: null,
        goodDescription: null,
        proformaNo: null,
        blNo: null,
        inspectionFeeInRial: totalInspectionFeeInRial,
        caseType: null,
        invoicePaymentStatus: null,
        state: null,
        goodField: null,
        hasFile: null,
        createdAt: null,
      });
      const excel = generateExcel(
        [
          'ردیف',
          'شماره درخواست',
          'شماره گواهی',
          'نوع بازرسی',
          'جزئیات بازرسی',
          'خریدار',
          'مشتری',
          'نام آزمایشگاه',
          'Description of Goods',
          'Performa No',
          'B/L No',
          'هزینه بازرسی به ریال',
          'نوع پرداخت',
          'وضعیت پرداخت',
          'وضعیت فرایند',
          'کالا',
          'فایل بازرسی',
          'تاریخ',
        ],
        flattenedData,
        'instances',
      );

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=instances.xlsx`,
      );

      return res.end(excel);
    }

    const data = await this.processInstanceService.findAll(null, getQueryDto);
    const resultData: any[] = JSON.parse(JSON.stringify(data.data));

    for (const elem of resultData) {
      const inspectionFile = await this.filesService.getInstanceInspectionFiles(
        elem.parameters?.InspectionInstanceId,
      );
      const files = await this.filesService.getInstanceFiles(elem.id);
      elem.hasFile = !!(inspectionFile.length != 0 || files.length != 0);
    }

    res.json({
      result: {
        data: resultData,
        count: data.count,
      },
    });
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.PROCESS_INSTANCE,
  })
  @Get('customer-coordinator')
  async getInstanceForCustomerAndCoordinator(
    @Res() res: Response,
    @Query() getQueryDto: GetQueryWithDownloadDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    const filter = JSON.parse(getQueryDto.filters || '{}');
    if (
      !user.groups.some((g) =>
        [
          'system-admin',
          'coordinator',
          'ceo',
          'coi-manager',
          'ic-manager',
          'ic-expert',
          'coi-expert',
        ].includes(g),
      )
    ) {
      throw new ForbiddenException('you cant read this data');
    }

    if (
      !user.groups.some((g) =>
        ['ceo', 'coi-manager', 'ic-manager', 'system-admin'].includes(g),
      )
    ) {
      filter.$and = [
        {
          $or: [
            {
              'parameters.Assignees.coordinator.id': user.id,
            },
            {
              'parameters.Assignees.marketer.id': user.id,
            },
          ],
        },
        {
          $or: [
            { 'parameters.Branch.id': user.branchId },
            { 'parameters.BranchId': user.branchId },
          ],
        },
      ];
      // filter.$or = [
      //   { 'parameters.Branch.id': user.branchId },
      //   { 'parameters.BranchId': user.branchId },
      // ];
      // filter['parameters.Assignees.coordinator.id'] = user.id;
    }
    filter.status = 'completed';
    filter['parameters.InvoicePaymentStatus'] = {
      $in: [
        InvoicePaymentStatuses.PARTIALLY_PAID,
        InvoicePaymentStatuses.UNPAID,
      ],
    };
    getQueryDto.props =
      'InspectionMethod,Buyer,Assignees.customer,CustomName,CaseType,Branch,InvoiceTotal';
    getQueryDto.filters = JSON.stringify(filter);
    let invoiceTotalSum = 0,
      unpaidAmountSum = 0;

    if (getQueryDto?.download === '1') {
      getQueryDto.page = null;
      getQueryDto.size = null;
      const { data } = await this.processInstanceService.findAll(
        null,
        getQueryDto,
      );
      const flattenedData = [];
      for (const pi of data) {
        const unpaidAmount = parseFloat(
          await this.incomeService.getUnpaidAmount(pi._id),
        );
        unpaidAmountSum += unpaidAmount;
        invoiceTotalSum += pi.parameters?.InvoiceTotal
          ? parseFloat(pi.parameters?.InvoiceTotal)
          : 0;
        flattenedData.push({
          caseNo: pi.caseNo,
          processDefinitionKey: this.i18nService.translate(
            `common.${pi.processDefinitionKey}`,
            { lang: 'fa' },
          ),
          inspectionMethod: this.i18nService.translate(
            `common.${pi.parameters?.InspectionMethod}`,
            { lang: 'fa' },
          ),
          buyerName: pi.parameters?.Buyer?.name,
          customerName: pi.parameters?.Assignees?.customer?.name,
          invoiceTotalSum: pi.parameters?.InvoiceTotal,
          unpaidAmountSum: unpaidAmount,
          customName: pi.parameters?.CustomName,
          caseType: this.i18nService.translate(
            `common.${pi.parameters?.CaseType}`,
            { lang: 'fa' },
          ),
          branch: pi.parameters?.Branch?.name,
          createdAt: gregorianDateTimeToJalali(pi['createdAt']),
        });
      }

      flattenedData.push({
        caseNo: null,
        processDefinitionKey: null,
        inspectionMethod: null,
        buyerName: null,
        customerName: null,
        invoiceTotalSum,
        unpaidAmountSum,
        customName: null,
        caseType: null,
        branch: null,
        createdAt: null,
      });
      const excel = generateExcel(
        [
          'شماره درخواست',
          'نوع بازرسی',
          'جزئیات بازرسی',
          'خریدار',
          'مشتری',
          'هزینه بازرسی',
          'پرداخت نشده',
          'گمرک',
          'نوع پرداخت',
          'شعبه',
          'تاریخ',
        ],
        flattenedData,
        'instances',
      );

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=instances.xlsx`,
      );

      return res.end(excel);
    }

    const processInstances = await this.processInstanceService.findAll(
      null,
      getQueryDto,
    );
    for (const pi of processInstances.data) {
      pi.set('unpaidAmount', await this.incomeService.getUnpaidAmount(pi._id), {
        strict: false,
      });
    }

    getQueryDto.page = null;
    getQueryDto.size = null;
    const { data } = await this.processInstanceService.findAll(
      null,
      getQueryDto,
    );

    for (const pi of data) {
      unpaidAmountSum += parseFloat(
        await this.incomeService.getUnpaidAmount(pi._id),
      );
      invoiceTotalSum += pi.parameters?.InvoiceTotal
        ? parseFloat(pi.parameters?.InvoiceTotal)
        : 0;
    }

    const response = new CustomResponse(HttpStatus.OK, 'Data prepared', {
      ...processInstances,
      invoiceTotalSum,
      unpaidAmountSum,
    });
    res.json(response);
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.PROCESS_INSTANCE,
  })
  @Get('invoice-payment-report')
  async getInvoicePaymentReport(
    @Res() res: Response,
    @ActiveUser() user: ActiveUserData,
    @Query() getQueryDto: GetQueryDto,
  ) {
    let filters: any = getQueryDto.filters || '{}';
    filters = {
      ...JSON.parse(filters),
      status: 'completed',
      processDefinitionKey: 'Financial_Invoice_Payment',
    };

    const data: ProcessInstanceDocument[] =
      await this.processInstanceService.findAllInstances(
        filters,
        'invoiceItems',
        'caseNo updatedAt parameters.InvoiceItems parameters.PaymentType parameters.Assignees parameters.BankAccount parameters.ReceiptNo parameters.PaymentAmount parameters.PaymentDate parameters.VoucherNo',
      );

    let currentRow = 0;
    const flattenedData = [];
    const merges = [];
    for (const pi of data) {
      const numItems = pi?.parameters?.InvoiceItems?.length || 1;

      pi.parameters.InvoiceItems.forEach((item, index) => {
        const invoice = pi['invoiceItems'][index];
        flattenedData.push({
          caseNos: item?.caseNos?.join('-') || 'NONE',
          issueNo: invoice?.issueNo || 'NONE',
          finDocumentDate: gregorianDateTimeToJalali(pi['updatedAt']) || 'NONE',
          paymentType:
            index === 0
              ? this.i18nService.translate(
                  `common.${pi?.parameters?.PaymentType}`,
                  {
                    lang: 'fa',
                  },
                )
              : '',
          bankAccount:
            index === 0
              ? detectBankAccountName(pi?.parameters?.BankAccount)
              : '',
          receiptNo: index === 0 ? pi?.parameters?.ReceiptNo : '',
          paymentAmount:
            index === 0
              ? pi?.parameters?.PaymentAmount
                ? parseFloat(pi?.parameters?.PaymentAmount)
                : 0
              : '',
          paymentDate: index === 0 ? pi?.parameters?.PaymentDate : '',
          voucherNo: index === 0 ? pi?.parameters?.VoucherNo : '',
          creatorName:
            index === 0 ? pi?.parameters?.Assignees?.creator?.name : '',
        });
      });
      if (numItems > 1) {
        for (let col = 3; col <= 9; col++) {
          merges.push({
            s: { r: currentRow + 1, c: col },
            e: { r: currentRow + numItems, c: col },
          });
        }
      }
      currentRow += numItems;
    }
    const excel = generateExcel(
      [
        'شماره فایل ها',
        'شماره فاکتور',
        'تاریخ سند',
        'نوع پرداخت',
        'نام بانک',
        'شماره رسید',
        'مبلغ',
        'تاریخ پرداخت',
        'شماره سند',
        'وصول کننده',
      ],
      flattenedData,
      'invoice-payment-report',
      merges,
      ['مبلغ'],
    );

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=invoice-payment-report.xlsx`,
    );
    return res.end(excel);
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.PROCESS_INSTANCE,
  })
  @Get('financial')
  @ApiQuery({
    name: 'download',
    required: false, // This makes the query parameter optional
    enum: DownloadTypes, // If you're using an enum for possible download types
    description: 'The format for downloading the invoice (PDF/HTML)',
  })
  async getInstanceForFinancial(
    @Query() getQueryDto: GetQueryDto,
    @ActiveUser() user: ActiveUserData,
    @Res({ passthrough: true }) res: Response,
    @Query('download') download?: string,
  ) {
    const filter = JSON.parse(getQueryDto.filters || '{}');
    filter.processDefinitionKey = 'paymentOrder';
    getQueryDto.filters = JSON.stringify(filter);
    if (download === DownloadTypes.Excel) {
      getQueryDto.page = null;
      getQueryDto.size = null;
      let row = 1;
      getQueryDto.populate = 'creator owner';
      getQueryDto.props =
        'caseNo,Title,Amount,owner,Priority,PaymentDate,ProcessType,currentState,Description,PayDes,ReviewDes,UserInformation';
      const { data } = await this.processInstanceService.findAll(
        null,
        getQueryDto,
      );

      const flattenedData = [];
      for (let i = 0; i < data.length; i++) {
        flattenedData.push({
          row: row++,
          caseNo: data[i].caseNo,
          title: data[i]?.parameters?.Title,
          amount: data[i]?.parameters?.Amount
            ? parseFloat(data[i]?.parameters?.Amount)
            : 0,
          owner: data[i]['creator']?.name + ' ' + data[i]['creator']?.lastname,
          priority: data[i]?.parameters?.Priority,
          paymentDate: data[i]?.parameters?.PaymentDate,
          processType: data[i]?.parameters?.ProcessType,
          currentSate: this.i18nService.translate(
            `common.${data[i]?.currentState}`,
            { lang: 'fa' },
          ),
          description: data[i]?.parameters?.Description,
          payDes: data[i]?.parameters?.PayDes,
          ReviewDes: data[i]?.parameters?.ReviewDes,
        });
      }
      const excel = generateExcel(
        [
          'ردیف',
          'شماره درخواست',
          'عنوان',
          'مبلغ',
          'درخواست دهنده',
          'اولویت',
          'تاریخ پرداخت	',
          'دسته بندی',
          'وضعیت',
          'توضیحات درخواست دهنده',
          'توضیحات درخواست دهنده	',
          'توضیحات مالی	',
        ],
        flattenedData,
        'payment-orders',
        [],
        ['مبلغ'],
      );

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=payment-orders.xlsx`,
      );

      return res.end(excel);
    }

    const processInstances = await this.processInstanceService.findAll(
      null,
      getQueryDto,
    );

    return processInstances;
  }

  // @CheckPermissions({
  //   action: PermissionAction.READ,
  //   subject: Subjects.PROCESS_INSTANCE_REPORT,
  // })
  @Post('report')
  async getInstancesReport(@Body() instanceReportDto: InstanceReportDto) {
    const result = await this.processInstanceService.getInstancesReport(
      instanceReportDto,
    );

    return result;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.PROCESS_INSTANCE,
  })
  @Get('participates')
  async findParticipateInstances(
    @ActiveUser() user: ActiveUserData,
    @Query() getQueryDto: GetQueryDto,
  ): Promise<CustomResponse | CustomError> {
    const result = await this.processInstanceService.getParticipateInstances(
      getQueryDto,
      user?.id,
    );
    return new CustomResponse(HttpStatus.OK, CustomMessages.SUCCESS, result);
  }

  // @Post(':processDefinitionId')
  // async createByDefinitionId(
  //   @ActiveUser() user: ActiveUserData,
  //   @Param('processDefinitionId') processDefinitionId: string,
  // ): Promise<CustomResponse | CustomError> {
  //   return this.processInstanceService.createByDefinitionId(
  //     processDefinitionId,
  //   );
  // }

  // @Post('key/:key')
  // async createByDefinitionKey(
  //   @ActiveUser() user: ActiveUserData,
  //   @Param('key') key: string,
  //   @Query() query: GetOneProcessInstanceQueryDto,
  // ): Promise<CustomResponse | CustomError> {
  //   return this.processInstanceService.createByDefinitionKey(query, key);
  // }

  // @Post(':processInstanceId/start')
  // async start(
  //   @ActiveUser() user: ActiveUserData,
  //   @Param('processInstanceId') processInstanceId: string,
  //   @Body() createProcessInstanceDto: CreateProcessInstanceDto,
  // ): Promise<CustomResponse | CustomError> {
  //   return this.processInstanceService.start(processInstanceId, {
  //     ...createProcessInstanceDto,
  //     owner: user.id,
  //   });
  // }

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.PROCESS_INSTANCE,
  })
  @Post('run/:processDefinitionId')
  async runByDefinitionId(
    @ActiveUser() user: ActiveUserData,
    @Param('processDefinitionId') processDefinitionId: string,
    @Body() createProcessInstanceDto: CreateProcessInstanceDto,
  ): Promise<CustomResponse | CustomError> {
    if (
      !!createProcessInstanceDto.amount &&
      createProcessInstanceDto.checkCredit
    ) {
      const canDoIt = await this.debtService.canPaidThisAmount(
        user.id,
        createProcessInstanceDto.amount,
      );
      if (!canDoIt)
        throw new BadRequestException('you cant run this definition');
    }
    const data = await this.processInstanceService.runByDefinitionId(
      user,
      processDefinitionId,
      {
        ...createProcessInstanceDto,
        owner: user.id,
      },
    );
    if (!!createProcessInstanceDto.amount) {
      await this.debtService.addDebt(
        user.id,
        createProcessInstanceDto.amount,
        data['result'].id,
      );
    }

    return data;
  }

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.PROCESS_INSTANCE,
  })
  @Post(':processInstanceId/duplicate')
  async dublicateInstance(
    @ActiveUser() user: ActiveUserData,
    @Param('processInstanceId') processInstanceId: string,
    @Body() duplicateInstanceDto: DuplicateInstanceDto,
  ): Promise<CustomResponse | CustomError> {
    const data = await this.processInstanceService.duplicateInstance(
      user,
      processInstanceId,
      {
        parameters: duplicateInstanceDto.parameters,
        owner: user.id,
      },
      duplicateInstanceDto.excludes,
    );

    return data;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.PROCESS_INSTANCE,
  })
  @Get(':processDefinitionId/list')
  async findAll(
    @ActiveUser() user: ActiveUserData,
    @Param('processDefinitionId') processDefinitionId: string,
    @Query() getProcessInstanceDto: GetQueryDto,
  ): Promise<CustomResponse | CustomError> {
    const result = await this.processInstanceService.getInstancesByDefinitionId(
      processDefinitionId,
      getProcessInstanceDto,
    );
    return new CustomResponse(HttpStatus.OK, CustomMessages.SUCCESS, result);
  }

  // @Get('key/:key/list')
  // async findAllByKey(
  //   @ActiveUser() user: ActiveUserData,
  //   @Param('key') processDefinitionKey: string,
  //   @Query() getProcessInstanceDto: GetProcessInstanceQueryDto,
  // ): Promise<CustomResponse | CustomError> {
  //   return this.processInstanceService.getInstancesByDefinitionKey(
  //     processDefinitionKey,
  //     getProcessInstanceDto,
  //   );
  // }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.PROCESS_INSTANCE,
  })
  @Get(':processInstanceId')
  async findOne(
    @ActiveUser() user: ActiveUserData,
    @Param('processInstanceId') id: string,
    @Query() { props }: PropDto,
  ): Promise<CustomResponse | CustomError> {
    const data = await this.processInstanceService.findOne(
      id,
      props?.split(','),
    );
    if (!data) {
      throw new CustomError(
        HttpStatus.BAD_REQUEST,
        CustomMessages.WORKFLOW_NOT_FOUND,
      );
    }
    return new CustomResponse(HttpStatus.OK, CustomMessages.SUCCESS, data);
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.PROCESS_INSTANCE,
  })
  @Get(':processInstanceId/inspectors')
  async getInspectorInstance(
    @Res() res: Response,
    @Param('processInstanceId') id: string,
  ) {
    const data = (await this.processInstanceService.findOneWithCondition({
      _id: id,
      processDefinitionKey: 'Inspectors',
    })) as any;

    data.parameters.InspectorAssignee =
      await this.userFilesService.getUserSignature(
        data.parameters?.InspectorAssignee,
      );
    data.parameters.SupervisorAssignee =
      await this.userFilesService.getUserSignature(data.parameters?.Supervisor);

    data.date = moment(data.createdAt).format('jYYYY-jMM-jDD');

    const template = await fs.readFile(
      `./assets/templates/inspectors.html`,
      'utf8',
    );
    const html = ejs.compile(template)(data);
    const file = (await generatePdfStream(html)) as any;
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="inspectors-instance-${id}.pdf"`,
    });
    return res.send(file);
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.PROCESS_INSTANCE,
  })
  @Get(':processInstanceId/inspection-images')
  async findImagesOfInstance(
    @Res() res: Response,
    @Param('processInstanceId') id: string,
  ) {
    const images = await this.filesService.getInstanceImages(id);
    const template = await fs.readFile(
      `./assets/templates/inspection-images.html`,
      'utf8',
    );
    const html = ejs.compile(template)({ images });
    const file = (await generatePdfWithGoTo(html)) as any;
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="images-${id}.pdf"`,
    });
    return res.send(file);
  }

  @Get(':processInstanceId/public')
  async findOnePublic(
    @Param('processInstanceId') id: string,
    @Query() { props }: PropDto,
  ) {
    const instance = await this.processInstanceService.findOnePublic(
      id,
      props?.split(','),
    );
    if (!instance) {
      throw new NotFoundException('instance not found.');
    }
    return instance;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.PROCESS_INSTANCE,
  })
  @Get('stats/:processDefinitionId')
  async getStatsByDefinitionId(
    @ActiveUser() user: ActiveUserData,
    @Param('processDefinitionId') processDefinitionId: string,
    @Query() query: GetProcessInstanceStatsQueryDto,
  ): Promise<CustomResponse | CustomError> {
    const result = await this.processInstanceService.getStatsByDefinitionId(
      processDefinitionId,
      query,
    );
    return new CustomResponse(HttpStatus.OK, CustomMessages.SUCCESS, result);
  }

  // @Get('stats/key/:key')
  // async getStatsByDefinitionKey(
  //   @ActiveUser() user: ActiveUserData,
  //   @Param('key') processDefinitionKey: string,
  //   @Query() query: GetProcessInstanceStatsQueryDto,
  // ): Promise<CustomResponse | CustomError> {
  //   return this.processInstanceService.getStatsByDefinitionKey(
  //     processDefinitionKey,
  //     query,
  //   );
  // }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.PROCESS_INSTANCE,
  })
  @Put(':processInstanceId')
  async updateInstances(
    @ActiveUser() user: ActiveUserData,
    @Param('processInstanceId') processInstanceId: string,
    @Body() updateProcessInstanceDto: UpdateProcessInstanceDto,
    @Query() query: UpdateProcessInstanceQueryDto,
  ): Promise<CustomResponse | CustomError> {
    const result = await this.processInstanceService.updateInstances(
      processInstanceId,
      updateProcessInstanceDto,
      query,
    );

    return new CustomResponse(
      HttpStatus.OK,
      CustomMessages.WORKFLOW_UPDATED,
      result,
    );
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.PROCESS_INSTANCE,
  })
  @Put(':processInstanceId/cancel')
  async cancelInstance(
    @Param('processInstanceId') processInstanceId: string,
    @Body() cancelProcessDto: CancelProcessInstanceDto,
    @ActiveUser() activeUser: ActiveUserData,
  ): Promise<CustomResponse | CustomError> {
    const result = await this.processInstanceService.cancelInstance(
      processInstanceId,
      activeUser.id,
      cancelProcessDto,
    );

    return new CustomResponse(
      HttpStatus.OK,
      CustomMessages.WORKFLOW_UPDATED,
      result,
    );
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.PROCESS_INSTANCE,
  })
  @Put(':processInstanceId/cancelInspectionInstance')
  async cancelInspectionInstance(
    @Param('processInstanceId') processInstanceId: string,
    @Body() cancelProcessDto: CancelProcessInstanceDto,
    @ActiveUser() activeUser: ActiveUserData,
  ): Promise<CustomResponse | CustomError> {
    const result = await this.processInstanceService.makeInspectionCancel(
      processInstanceId,
      activeUser,
      cancelProcessDto,
    );

    return new CustomResponse(
      HttpStatus.OK,
      CustomMessages.WORKFLOW_UPDATED,
      result,
    );
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.PROCESS_INSTANCE,
  })
  @Put(':processInstanceId/users/:userId/debt')
  async updateInstancesDebt(
    @ActiveUser() user: ActiveUserData,
    @Param('processInstanceId') instanceId: string,
    @Param('userId') userId: string,
    @Body() updateInstancesDebt: UpdateInstancesDebt,
  ) {
    if (
      !user.groups.includes('super-admin') &&
      !user.groups.includes('admins')
    ) {
      throw new ForbiddenException('you cant update this debt');
    }
    const instance = await this.processInstanceService.findOne(instanceId, []);
    if (instance.status === 'completed') {
      throw new BadRequestException('this instance is complete');
    }
    const updateNewDebt = await this.debtService.debtUpdated(
      userId,
      instanceId,
      updateInstancesDebt.amount,
      updateInstancesDebt.checkCredit,
    );
    if (!updateNewDebt) {
      throw new BadRequestException('user credit is not enough');
    }

    return updateNewDebt;
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.PROCESS_INSTANCE,
  })
  @Put(':processInstanceId/watcher/:watcherId')
  async updateWatchers(
    @Param() updateProcessWatcher: UpdateProcessWatcher,
  ): Promise<CustomResponse | CustomError> {
    const result = await this.processInstanceService.updateWatchers(
      updateProcessWatcher,
    );
    return new CustomResponse(HttpStatus.OK, CustomMessages.SUCCESS, result);
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.PROCESS_INSTANCE,
  })
  @Put(':processInstanceId/state/:stateName')
  async updateInstanceState(
    @Param() updateInstanceState: UpdateInstanceState,
  ): Promise<CustomResponse | CustomError> {
    const result = await this.processInstanceService.updateInstanceState(
      updateInstanceState,
    );
    return new CustomResponse(HttpStatus.OK, CustomMessages.SUCCESS, result);
  }

  @Put('test/test/estset/sdfdsf')
  async test() {
    this.processInstanceService.test();
  }

  // @Post('run/:processDefinitionId')
  // async runByDefinitionId(
  //   @ActiveUser() user: ActiveUserData,
  //   @Param('processDefinitionId') processDefinitionId: string,
  //   @Body() createProcessInstanceDto: CreateProcessInstanceDto,
  // ): Promise<CustomResponse | CustomError> {
  //   return this.processInstanceService.runByDefinitionId(processDefinitionId, {
  //     ...createProcessInstanceDto,
  //     owner: user.id,
  //   });
  // }

  // @Post('run/key/:key')
  // async runByDefinitionKey(
  //   @ActiveUser() user: ActiveUserData,
  //   @Param('key') key: string,
  //   @Query() query: GetOneProcessInstanceQueryDto,
  //   @Body() createProcessInstanceDto: CreateProcessInstanceDto,
  // ): Promise<CustomResponse | CustomError> {
  //   return this.processInstanceService.runByDefinitionKey(
  //     query,
  //     key,
  //     createProcessInstanceDto,
  //   );
  // }
}
