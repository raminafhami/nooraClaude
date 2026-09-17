import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { GetQueryDto } from '../process-instances/dtos';
import { ActiveUser } from '../iam/authentication/decorators/active-user.decorator';
import { ActiveUserData } from '../iam/authentication/interfaces/active-user-data.interface';
import { CheckPermissions } from '../iam/authentication/decorators/permissions.decorator';
import { PermissionAction, Subjects } from '../iam/authentication/enums';
import {
  DownloadTypes,
  InvoiceStatuses,
  InvoiceTypes,
} from 'src/common/const/enums';
import { Request, Response } from 'express';
import { groupBySimple, numberToPersianText } from 'src/common/utils/data.util';
import { generatePdfAndHtml } from '../files/file.utils';
import { HtmlResponse } from '../files/files.controller';
import { PayInvoiceDto } from './dto/pay-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { RevertInvoiceDto } from './dto/revert-invoice.dto';
import { CreateInvoiceManuallyDto } from './dto/create-invoice-manually.dto';
import { ForceUpdateDto } from './dto/force-update.dto';
import { GroupsGuard } from 'src/common/guards/groups.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { decrypt } from 'src/common/utils/crypto';
import { AppConfigService } from 'src/config/app/config.service';
import { NotifySmsDto } from './dto/notify-sms.dto';

@Controller('invoice')
@ApiTags('Invoice')
@ApiBearerAuth('token')
export class InvoiceController {
  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly appConfigService: AppConfigService,
  ) {}

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.INVOICES,
  })
  @Post()
  async create(
    @Body() createInvoiceDto: CreateInvoiceDto,
    @ActiveUser() activeUser: ActiveUserData,
    @Req() req: Request,
  ) {
    createInvoiceDto.createdBy = activeUser.id;
    return this.invoiceService.createInvoice(
      createInvoiceDto,
      activeUser,
      req['mongoSession'],
    );
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.INVOICES,
  })
  @Get()
  async get(@Query() getQueryDto: GetQueryDto) {
    const invoices = await this.invoiceService.findAll(getQueryDto);
    if (getQueryDto?.populate?.includes('items')) {
      for (const invoice of invoices.data) {
        let total = await this.invoiceService.calculateTotal(invoice._id);
        let tax = 0;
        if (invoice.type === InvoiceTypes.Official) {
          tax = await this.invoiceService.calculateTotalTax(invoice._id);
        }
        if (invoice.status !== InvoiceStatuses.Canceled) {
          invoice.set('total', total, { strict: false });
          invoice.set('tax', tax, { strict: false });
        }

        if (invoice.status === InvoiceStatuses.Canceled) {
          total = invoice.total;
          tax = invoice.tax;
        }
        invoice.set('totalPersianText', numberToPersianText(total + tax), {
          strict: false,
        });
      }
    }

    return invoices;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.INVOICES,
  })
  @Get('instances/:instanceId')
  async getByInstanceId(
    @Param('instanceId') instanceId: string,
    @Query() getQueryDto: GetQueryDto,
  ) {
    if (!getQueryDto?.populate?.includes('items')) {
      getQueryDto.populate = 'items';
    }

    const incomesIds = await this.invoiceService.getIncomesIdsByInstance(
      instanceId,
    );

    const filter = JSON.parse(getQueryDto.filters || '{}');
    filter.items = {
      $elemMatch: {
        $in: incomesIds,
      },
    };
    getQueryDto.filters = JSON.stringify(filter);

    const invoices = await this.invoiceService.findAll(getQueryDto);

    for (const invoice of invoices.data) {
      let total = await this.invoiceService.calculateTotal(invoice._id);
      let tax = 0;
      if (invoice.type === InvoiceTypes.Official) {
        tax = await this.invoiceService.calculateTotalTax(invoice._id);
      }
      if (invoice.status !== InvoiceStatuses.Canceled) {
        invoice.set('total', total, { strict: false });
        invoice.set('tax', tax, { strict: false });
      }
      if (invoice.status === InvoiceStatuses.Canceled) {
        total = invoice.total;
        tax = invoice.tax;
      }
      invoice.set('totalPersianText', numberToPersianText(total + tax), {
        strict: false,
      });
    }

    return invoices;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.INVOICES,
  })
  @Get(':invoiceId')
  @ApiQuery({
    name: 'download',
    required: false, // This makes the query parameter optional
    enum: DownloadTypes, // If you're using an enum for possible download types
    description: 'The format for downloading the invoice (PDF/HTML/xlsx)',
  })
  async getOne(
    @Param('invoiceId') invoiceId: string,
    @Res({ passthrough: true }) response: Response,
    @Query('download') download?: string,
  ) {
    const invoice = await this.invoiceService.findById(invoiceId, 'items');
    let total = await this.invoiceService.calculateTotal(invoice._id);
    let tax = 0;
    if (invoice.type === InvoiceTypes.Official) {
      tax = await this.invoiceService.calculateTotalTax(invoice._id);
    }
    if (invoice.status !== InvoiceStatuses.Canceled) {
      invoice.set('tax', tax, { strict: false });
      invoice.set('total', total, { strict: false });
    }
    if (invoice.status === InvoiceStatuses.Canceled) {
      total = invoice.total;
      tax = invoice.tax;
    }
    invoice.set('totalPersianText', numberToPersianText(total + tax), {
      strict: false,
    });

    // if (invoice.type === InvoiceTypes.Official) {
    //   invoice.set('tax', Math.trunc(total * 0.1), { strict: false });
    // } else {
    //   invoice.set('tax', 0, { strict: false });
    // }
    const groupedItems: any[] = groupBySimple(invoice.items, 'caseNo');
    switch (download) {
      case DownloadTypes.Pdf: {
        invoice.set('groupedItems', groupedItems, { strict: false });
        const file = await generatePdfAndHtml({
          data: JSON.parse(JSON.stringify(invoice)),
          download: 'pdf',
          outputFileName: invoice.invoiceNo,
          templateName: 'invoice.html',
          templatePath: './assets/templates/financial',
        });

        response.set({
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${invoice.invoiceNo}.pdf"`,
        });
        return new StreamableFile(file);
      }
      case DownloadTypes.Html: {
        const total = await this.invoiceService.calculateTotal(invoice._id);
        invoice.set('total', total, { strict: false });
        invoice.set('groupedItems', groupedItems, { strict: false });
        const file = await generatePdfAndHtml({
          data: JSON.parse(JSON.stringify(invoice)),
          download: 'html',
          outputFileName: invoice.invoiceNo,
          templateName: 'invoice.html',
          templatePath: './assets/templates/financial',
        });
        response.set({
          'Content-Type': 'html/text',
        });
        return new HtmlResponse(file);
      }
      default:
        return invoice;
    }
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.INVOICES,
  })
  @Post(':invoiceId/notify-sms')
  async notifyUser(
    @Param('invoiceId') invoiceId: string,
    @Body() { phoneNo }: NotifySmsDto,
  ) {
    await this.invoiceService.notifySms(invoiceId, phoneNo);
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.INVOICES,
  })
  @Roles(['system-admin', 'financial-expert', 'ceo', 'finance'])
  @UseGuards(GroupsGuard)
  @Patch('/force-update/:invoiceId')
  async forceUpdate(
    @Param('invoiceId') invoiceId: string,
    @Body() forceUpdateDto: ForceUpdateDto,
    @Req() req: Request,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    forceUpdateDto.activeUser = activeUser;
    return this.invoiceService.forceUpdate(
      invoiceId,
      forceUpdateDto,
      req['mongoSession'],
    );
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.INVOICES,
  })
  @Patch('/issue/:invoiceId')
  async issue(
    @Param('invoiceId') invoiceId: string,
    @ActiveUser() activeUser: ActiveUserData,
    @Req() req: Request,
  ) {
    return this.invoiceService.issue(
      invoiceId,
      activeUser,
      req['mongoSession'],
    );
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.INVOICES,
  })
  @Patch('/pending/:invoiceId')
  async pending(
    @Param('invoiceId') invoiceId: string,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.invoiceService.makeInvoicePend(invoiceId, activeUser);
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.INVOICES,
  })
  @Patch('/cancel/:invoiceId')
  async cancel(
    @Param('invoiceId') invoiceId: string,
    @ActiveUser() activeUser: ActiveUserData,
    @Req() req: Request,
  ) {
    return this.invoiceService.makeInvoiceCancel(
      invoiceId,
      activeUser,
      req['mongoSession'],
    );
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.INVOICES,
  })
  @Patch('/pay')
  async pay(
    @Body() payInvoiceDto: PayInvoiceDto,
    @ActiveUser() activeUser: ActiveUserData,
    @Req() req: Request,
  ) {
    return this.invoiceService.makeInvoicePaid(
      payInvoiceDto,
      activeUser,
      req['mongoSession'],
    );
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.INVOICES,
  })
  @Patch('revert-previous-state')
  async revertToPreviousState(
    @Body() revertInvoiceDto: RevertInvoiceDto,
    @ActiveUser() activeUser: ActiveUserData,
    @Req() req: Request,
  ) {
    return this.invoiceService.revertToPreviousState(
      revertInvoiceDto,
      activeUser,
      req['mongoSession'],
    );
  }

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.INVOICES,
  })
  @Post('create-invoice-manually')
  async createInvoiceManually(
    @Body() createCustomerInvoiceDto: CreateInvoiceManuallyDto,
    @ActiveUser() activeUser: ActiveUserData,
    @Req() req: Request,
  ) {
    return this.invoiceService.makeInvoiceManually(
      createCustomerInvoiceDto,
      activeUser,
      req['mongoSession'],
    );
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.INVOICES,
  })
  @Patch(':invoiceId')
  async update(
    @Param('invoiceId') invoiceId: string,
    @ActiveUser() activeUser: ActiveUserData,
    @Req() req: Request,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
  ) {
    return this.invoiceService.updateInvoice(
      invoiceId,
      updateInvoiceDto,
      activeUser,
      req['mongoSession'],
    );
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.INVOICES,
  })
  @Patch('test/test/ets')
  async test(@ActiveUser() activeUser: ActiveUserData, @Req() req: Request) {
    return await this.invoiceService.addOverdueCharge(
      activeUser,
      req['mongoSession'],
    );
  }

  @Get('/encrypt-invoice/:invoiceId')
  async encryptInvoice(@Param('invoiceId') invoiceId: string) {
    return this.invoiceService.encryptInvoice(invoiceId);
  }

  @ApiQuery({
    name: 'download',
    required: false,
    enum: DownloadTypes,
    description: 'The format for downloading the invoice (PDF/HTML)',
  })
  @Get('invoice-detail/data')
  async getInvoiceDetail(
    @Query('encryptedData') encryptedData: string,
    @Res({ passthrough: true }) response: Response,
    @Query('download') download?: string,
  ) {
    const invoiceId = decrypt(
      encryptedData,
      this.appConfigService.invoiceCryptoSecretKey,
    );
    const invoice = await this.invoiceService.findById(invoiceId, 'items');

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.status === InvoiceStatuses.Canceled) {
      throw new BadRequestException('Invoice status is canceled');
    }

    let total = await this.invoiceService.calculateTotal(invoice._id);
    let tax = 0;
    if (invoice.type === InvoiceTypes.Official) {
      tax = await this.invoiceService.calculateTotalTax(invoice._id);
    }
    if (invoice.status !== InvoiceStatuses.Canceled) {
      invoice.set('tax', tax, { strict: false });
      invoice.set('total', total, { strict: false });
    }
    if (invoice.status === InvoiceStatuses.Canceled) {
      total = invoice.total;
      tax = invoice.tax;
    }
    invoice.set('totalPersianText', numberToPersianText(total + tax), {
      strict: false,
    });
    const groupedItems: any[] = groupBySimple(invoice.items, 'caseNo');
    switch (download) {
      case DownloadTypes.Pdf: {
        invoice.set('groupedItems', groupedItems, { strict: false });
        const file = await generatePdfAndHtml({
          data: JSON.parse(JSON.stringify(invoice)),
          download: 'pdf',
          outputFileName: invoice.invoiceNo,
          templateName: 'invoice.html',
          templatePath: './assets/templates/financial',
        });

        response.set({
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${invoice.invoiceNo}.pdf"`,
        });
        return new StreamableFile(file);
      }
      case DownloadTypes.Html: {
        const total = await this.invoiceService.calculateTotal(invoice._id);
        invoice.set('total', total, { strict: false });
        invoice.set('groupedItems', groupedItems, { strict: false });
        const file = await generatePdfAndHtml({
          data: JSON.parse(JSON.stringify(invoice)),
          download: 'html',
          outputFileName: invoice.invoiceNo,
          templateName: 'invoice.html',
          templatePath: './assets/templates/financial',
        });
        response.set({
          'Content-Type': 'html/text',
        });
        return new HtmlResponse(file);
      }
      default:
        return invoice;
    }
  }
}
