import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CrudService } from 'src/shared/crud/service/crud.service';
import { InvoiceDocument } from './schemas/invoice.schema';
import { InvoiceRepository } from './repository/invoice.repository';
import {
  extractDistinctValues,
  objectValueIsTheSame,
} from 'src/common/utils/data.util';
import { IncomeService } from '../income/income.service';
import { ProcessInstanceService } from '../process-instances/process-instances.service';
import { IRecipient } from './interfaces/recipient.interface';
import { UsersService } from '../users/services/users.service';
import { UserDocument } from '../users/schemas/user.schema';
import { BuyerService } from '../users/services/buyer.service';
import { BuyerDocument } from '../users/schemas/buyer.schema';
import {
  CategoryKeys,
  currencies,
  IncomeStatuses,
  IncomeTypes,
  InstanceCaseTypes,
  InvoicePaymentStatuses,
  InvoiceStatuses,
  InvoiceTypes,
} from 'src/common/const/enums';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { ActiveUserData } from '../iam/authentication/interfaces/active-user-data.interface';
import mongoose, { ClientSession, mongo, UpdateWriteOpResult } from 'mongoose';
import { IndicatorService } from '../indicator/indicator.service';
import { ProcessInstanceDocument } from '../process-instances/schemas/process-instances.schema';
import { PersonnelDocument } from '../personnel/schemas/personnel.schema';
import { PersonnelService } from '../personnel/personnel.service';
import { InvoiceItem } from '../financial/dto/insert-invoice.dto';
import { IncomeDocument } from '../income/schemas/income.schema';
import { FinancialService } from '../financial/financial.service';
import { Schema as mSchema } from 'mongoose';
import { PayInvoiceDto } from './dto/pay-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { RevertInvoiceDto } from './dto/revert-invoice.dto';
import { addDays, getCurrentUtcDate } from 'src/common/providers/moment-date';
import { CreateInvoiceManuallyDto } from './dto/create-invoice-manually.dto';
import { GetQueryDto } from '../process-instances/dtos';
import { ForceUpdateDto } from './dto/force-update.dto';
import { CronJobService } from 'src/common/providers/cron-job.service';
import { QueueService } from '../queue/queue.service';
import { encrypt } from 'src/common/utils/crypto';
import { AppConfigService } from 'src/config/app/config.service';
import { SmsService } from '../sms/sms.service';

@Injectable()
export class InvoiceService extends CrudService<InvoiceDocument> {
  constructor(
    private readonly invoiceRepository: InvoiceRepository,
    @Inject(forwardRef(() => IncomeService))
    private readonly incomeService: IncomeService,
    @Inject(forwardRef(() => ProcessInstanceService))
    private readonly processInstanceService: ProcessInstanceService,
    private readonly userService: UsersService,
    private readonly buyerService: BuyerService,
    private readonly indicatorService: IndicatorService,
    private readonly personnelService: PersonnelService,
    private readonly financialService: FinancialService,
    private readonly queueService: QueueService,
    private readonly appConfigService: AppConfigService,
    private readonly smsService: SmsService,
  ) {
    super(invoiceRepository);
  }

  async createInvoice(
    createInvoiceDto: CreateInvoiceDto,
    activeUser: ActiveUserData,
    session: ClientSession,
  ): Promise<InvoiceDocument> {
    let {
      title,
      description,
      incomeIds,
      recipient,
      additionalFee,
      discount,
      type,
    } = createInvoiceDto;

    //#region Validations
    //!checking incomes not be in any active invoice (most important validation in creating invoice)
    const incomesInActiveInvoice =
      await this.invoiceRepository.findWithOutPagination({
        items: { $elemMatch: { $in: incomeIds } },
        status: { $ne: InvoiceStatuses.Canceled },
      });

    if (incomesInActiveInvoice.length > 0) {
      throw new ForbiddenException('Incomes are in active or pending invoice');
    }

    const incomes = await this.incomeService.findWithOutPagination(
      {
        _id: { $in: incomeIds },
      },
      'categoryId',
    );

    const incomesInSameType = objectValueIsTheSame(incomes, 'currency');
    if (!incomesInSameType) {
      throw new ForbiddenException('Incomes are not in the same type');
    }

    const total = incomes.reduce((acc, cur) => cur['total'] + acc, 0);

    //! Checking incomes are created for instances or are free
    if (!objectValueIsTheSame(incomes, 'type')) {
      throw new ForbiddenException('Items should be in the same type');
    }

    let instances = [];
    //! Checking all incomes in the same type of instance (Official - unOfficial)
    if (incomes[0].instanceId) {
      const distinctInstanceIds = extractDistinctValues(incomes, 'instanceId');
      instances = await this.processInstanceService.findAllInstances({
        _id: { $in: distinctInstanceIds },
      });

      if (!objectValueIsTheSame(instances, 'parameters.CaseType')) {
        throw new ForbiddenException('Incomes are not in the same type');
      }
      //! All incomes should be only for one buyer
      if (instances[0].parameters.CaseType === InstanceCaseTypes.Official) {
        if (!objectValueIsTheSame(instances, 'parameters.Buyer.id')) {
          throw new ForbiddenException('Incomes must be only for one buyer');
        }
      } else {
        if (!objectValueIsTheSame(instances, 'parameters.Branch.managerId')) {
          if (
            !objectValueIsTheSame(instances, 'parameters.Assignees.customer.id')
          ) {
            if (
              !objectValueIsTheSame(instances, 'parameters.Branch.managerId')
            ) {
              throw new ForbiddenException(
                'Incomes must be only for one branch',
              );
            }
            throw new ForbiddenException(
              'Incomes must be only for one customer',
            );
          }
        }
      }
    }

    //#endregion validations

    const invoiceNo = await this.indicatorService.findByKeyAndIncrement(
      'invoice',
    );

    if (recipient.refId) {
      recipient = await this.findInvoiceRecipient(instances[0]);
      if (!recipient) {
        throw new NotFoundException('Recipient not found');
      }
    }

    let invoice, expiryAt;

    const currentUtcDate = getCurrentUtcDate();
    if (incomes[0].currency === currencies.Rial) {
      expiryAt = addDays(currentUtcDate, 60);
    } else {
      expiryAt = addDays(currentUtcDate, 5);
    }
    //Azad invoice
    if (!incomes[0].instanceId) {
      invoice = await this.invoiceRepository.create({
        title: createInvoiceDto.title,
        description: createInvoiceDto.description,
        type: createInvoiceDto.type,
        expiryAt,
        items: createInvoiceDto.incomeIds,
        recipient: createInvoiceDto.recipient,
        invoiceNo,
        updatedBy: activeUser.id,
        createdBy: activeUser.id,
      });
    } else {
      invoice = await this.invoiceRepository.create(
        {
          title,
          description,
          type: instances[0]?.parameters?.CaseType
            ? instances[0]?.parameters?.CaseType
            : InvoiceTypes.Unofficial,
          expiryAt,
          items: incomeIds,
          recipient,
          invoiceNo: invoiceNo,
          discount,
          additionalFee,
          createdBy: activeUser.id,
          updatedBy: activeUser.id,
        },
        session,
      );
    }
    await this.incomeService.updateMany(
      { _id: { $in: incomeIds } },
      { status: IncomeStatuses.Pending },
      session,
    );

    return invoice;
  }

  async findInvoiceRecipient(
    processInstance: ProcessInstanceDocument,
  ): Promise<IRecipient> {
    let recipient: BuyerDocument | UserDocument;

    if (processInstance?.parameters?.CaseType === InstanceCaseTypes.Official) {
      recipient = await this.buyerService.findById(
        processInstance.parameters.Buyer.id,
      );
      return {
        refId: recipient._id,
        name: recipient.name,
        lastname: null,
        address: recipient.address,
        financialId: recipient?.metadata?.sepidarId,
        registrationNo: recipient?.metadata?.registrationNo,
        economicCode: recipient.nationalCode,
        nationalCode: recipient.nationalCode,
        fax: recipient?.contactNo[1]?.split(':')[1],
        phone: recipient?.contactNo[0]?.split(':')[1],
        postalCode: recipient.postalCode,
      };
    } else {
      if (processInstance?.parameters?.Branch) {
        recipient = await this.userService.findById(
          processInstance.parameters.Branch.managerId,
        );
      } else if (processInstance.parameters?.Assignees?.customer) {
        recipient = await this.userService.findById(
          processInstance.parameters.Assignees.customer.id,
        );
      }
      const personnel: PersonnelDocument = await this.personnelService.findOne({
        userId: recipient._id,
      });

      return {
        refId: recipient._id,
        name: recipient.name,
        lastname: recipient['lastname'],
        address: personnel?.address,
        financialId: recipient['sepidarId'],
        registrationNo: null,
        economicCode: null,
        nationalCode: recipient.nationalCode,
        fax: null,
        phone: recipient['phoneNo'],
        postalCode: null,
      };
    }
  }

  async calculateTotal(invoiceId: string, pure = false): Promise<number> {
    const invoice: InvoiceDocument = await this.invoiceRepository.findById(
      invoiceId,
      'items',
    );

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }
    let totalIncomes = 0;
    totalIncomes = invoice.items.reduce((acc, cur) => cur['total'] + acc, 0);
    if (pure) {
      return totalIncomes;
    }
    if (invoice.type === InvoiceTypes.Official) {
      totalIncomes = totalIncomes + invoice.additionalFee - invoice.discount;
    } else {
      totalIncomes = totalIncomes + invoice.additionalFee - invoice.discount;
    }
    return totalIncomes;
  }

  async calculateTotalTax(invoiceId: string) {
    const invoice: InvoiceDocument = await this.invoiceRepository.findById(
      invoiceId,
      'items',
    );

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    let totalTax = 0;
    totalTax = invoice.items.reduce((acc, cur) => cur['tax'] + acc, 0);
    return totalTax;
  }

  async calculateTotalWithTax(invoiceId: string) {
    const invoice: InvoiceDocument = await this.invoiceRepository.findById(
      invoiceId,
      'items',
    );

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    let totalTax = 0;
    totalTax = invoice.items.reduce((acc, cur) => cur['tax'] + acc, 0);
    let totalIncomes = 0;
    totalIncomes = invoice.items.reduce((acc, cur) => cur['total'] + acc, 0);

    if (invoice.type === InvoiceTypes.Official) {
      totalIncomes = totalIncomes + invoice.additionalFee - invoice.discount;
    } else {
      totalIncomes = totalIncomes + invoice.additionalFee - invoice.discount;
    }
    return { amount: totalIncomes + totalTax, invoiceNo: invoice.invoiceNo };
  }

  async issue(
    invoiceId: string,
    activeUser: ActiveUserData,
    session?: ClientSession,
  ): Promise<string> {
    try {
      const invoice: InvoiceDocument = await this.invoiceRepository.findById(
        invoiceId,
        'items',
      );

      if (!invoice) {
        throw new NotFoundException('Invoice not found');
      }
      const now = new Date();

      if (now.getTime() <= invoice.lock) {
        throw new ForbiddenException('Invoice is progressing');
      }

      /**
       * ! Users can issue active invoices
       * */

      if (
        invoice.status !== InvoiceStatuses.Active &&
        invoice.status !== InvoiceStatuses.Pending
      ) {
        throw new ForbiddenException('you cannot issue this invoice');
      }

      //TODO fill invoice recipient
      if (!invoice?.recipient?.financialId) {
        const recipient = await this.fillInvoiceRecipient(invoice);
        invoice.recipient = recipient;
      }
      if (!invoice?.recipient?.financialId) {
        throw new BadRequestException('Recipient information is not completed');
      }
      invoice.markModified('recipient');
      await invoice.save();
      // making invoice items
      const invoiceItems: InvoiceItem[] = [];
      const items: IncomeDocument[] =
        await this.incomeService.findWithOutPagination(
          { _id: { $in: invoice.items } },
          'categoryId',
        );
      const caseNumbers = [];
      items.forEach((item) => {
        if (!caseNumbers.includes(item.caseNo)) {
          caseNumbers.push(item.caseNo);
        }
        let invoiceItem = new InvoiceItem();
        invoiceItem = {
          duty: item.duty.toString(),
          fee: Math.trunc(item.amount * item.currencyRate).toString(),
          itemCode: item.categoryId['code'],
          itemDescription: `${item.caseNo} - ${item.description}`,
          quantity: item.quantity.toString(),
          tax: item.tax.toString(),
        };
        invoiceItems.push(invoiceItem);
      });
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0'); // Ensure 2 digits
      const day = String(today.getDate()).padStart(2, '0'); // Ensure 2 digits
      const formattedDate = `${year}-${month}-${day}`;

      let number = null;
      if (invoice.type === InvoiceTypes.Official) {
        number = await this.indicatorService.findByKeyAndIncrement(
          'officialFinNo',
          session,
        );
      }
      let deliveryLocation = caseNumbers.join(', ');
      if (deliveryLocation.length > 250) {
        deliveryLocation = deliveryLocation.slice(0, 240) + '- غیره';
      }
      const issueNumber = await this.financialService.insertInvoice({
        customerCode: invoice.recipient.financialId,
        date: formattedDate, // it is vary based on invoice type
        deliveryLocation,
        description: invoice.description,
        invoiceItems,
        number,
        saleTypeNumber: '1',
      });

      if (issueNumber.ErrorMessage || issueNumber === undefined) {
        throw new InternalServerErrorException(
          'An error occurred in financial service',
        );
      }

      await this.incomeService.updateMany(
        { _id: { $in: invoice.items } },
        { status: IncomeStatuses.Pending },
        session,
      );

      const updateResult = await this.invoiceRepository.updateById(
        invoiceId,
        {
          issueNo: issueNumber,
          issuedAt: new Date(),
          status: InvoiceStatuses.Issued,
          issuedBy: activeUser.id,
          updatedBy: activeUser.id,
        },
        session,
      );
      return issueNumber;
    } catch (error) {
      throw error;
    }
  }

  async makeInvoicePend(
    invoiceId: string,
    activeUser: ActiveUserData,
    session?: ClientSession,
  ): Promise<UpdateWriteOpResult> {
    const invoice: InvoiceDocument = await this.invoiceRepository.findById(
      invoiceId,
    );

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }
    const now = new Date();

    if (now.getTime() <= invoice.lock) {
      throw new ForbiddenException('Invoice is progressing');
    }
    /**
     * ! Users can issue active invoices
     * ! Financial staffs can issue pending invoice
     * */

    if (
      invoice.status !== InvoiceStatuses.Active &&
      invoice.status !== InvoiceStatuses.Issued
    ) {
      throw new ForbiddenException('you cannot issue this invoice');
    }

    const includedIncomes = await this.incomeService.findWithOutPagination({
      _id: { $in: invoice.items },
    });

    for (const income of includedIncomes) {
      if (income?.instanceId) {
        await this.processInstanceService.updateInstances(
          income.instanceId.toString(),
          {
            parameters: {
              InvoicePaymentStatus: InvoicePaymentStatuses.PENDING,
            },
          },
          { cascade: 'false' },
        );
      }
    }

    await this.incomeService.updateMany(
      { _id: { $in: invoice.items } },
      { status: IncomeStatuses.Pending },
      session,
    );

    const updateResult = await this.invoiceRepository.updateById(
      invoiceId,
      {
        status: InvoiceStatuses.Pending,
        updatedBy: activeUser.id,
      },
      session,
    );

    return updateResult;
  }

  async makeInvoicePaid(
    payInvoiceDto: PayInvoiceDto,
    activeUser: ActiveUserData,
    session?: ClientSession,
  ): Promise<unknown> {
    let { invoiceIds, financialDocumentId, date, trackingCode } = payInvoiceDto;
    const invoices = await this.invoiceRepository.findWithOutPagination(
      {
        _id: invoiceIds,
      },
      'items',
    );
    for (let i = 0; i < invoices.length; i++) {
      /**
       * ! Users can issue active invoices
       *
       * */
      const now = new Date();

      if (now.getTime() <= invoices[i].lock) {
        throw new ForbiddenException('Invoice is progressing');
      }

      if (
        invoices[i].status !== InvoiceStatuses.Active &&
        invoices[i].status !== InvoiceStatuses.Issued &&
        invoices[i].status !== InvoiceStatuses.Pending
      ) {
        throw new ForbiddenException('you cannot paid this invoice');
      }

      //If invoice in active status so we have to get sepidarNo
      // if (invoice.status === InvoiceStatuses.Active) {
      //   invoice = await this.issue(invoice._id, activeUser);
      // }

      if (!invoices[i].issueNo) {
        //   throw new ForbiddenException('Invoice should be issued first');
        const issueNo = await this.issue(invoices[i]._id, activeUser);
        invoices[i].issueNo = issueNo;
        if (!invoices[i]?.recipient?.financialId) {
          const modifiedInvoice = await this.invoiceRepository.findById(
            invoices[i]._id,
          );
          invoices[i].recipient = { ...modifiedInvoice.recipient };
        }
        await invoices[i].save();
      }

      await this.incomeService.updateMany(
        { _id: { $in: invoices[i].items } },
        { status: IncomeStatuses.Paid },
        session,
      );

      const updateResult = await this.invoiceRepository.updateById(
        invoices[i]._id,
        {
          status: InvoiceStatuses.Paid,
          updatedBy: activeUser.id,
        },
        session,
      );
    }
    if (!financialDocumentId) {
      const voucherItems =
        await this.financialService.generateVoucherItemsFromInvoices(
          invoices,
          payInvoiceDto.dlCode,
          payInvoiceDto.slCode,
          trackingCode,
        );

      let headerDescription =
        this.financialService.getFinDocDescription(invoices);
      if (headerDescription.length > 220) {
        headerDescription = headerDescription.slice(0, 210) + ' غیره';
      }
      financialDocumentId = await this.financialService.insertVouchers({
        date,
        headerDescription: headerDescription + `رهگیری ${trackingCode}`,
        items: voucherItems,
      });
    }
    const updatedResult = await this.invoiceRepository.updateMany(
      { _id: { $in: invoiceIds } },
      { financialDocumentId },
      session,
    );

    await this.syncInstancesPaymentStatus(invoiceIds, session);

    return financialDocumentId;
  }

  async makeInvoiceCancel(
    invoiceId: string,
    activeUser: ActiveUserData,
    session?: ClientSession,
  ): Promise<UpdateWriteOpResult> {
    const invoice: InvoiceDocument = await this.invoiceRepository.findById(
      invoiceId,
    );

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }
    const now = new Date();

    if (now.getTime() <= invoice.lock) {
      throw new ForbiddenException('Invoice is progressing');
    }

    if (invoice.status === InvoiceStatuses.Paid) {
      throw new ForbiddenException(
        'You cannot cancel registered invoice on financial system',
      );
    }

    await this.incomeService.updateMany(
      { _id: { $in: invoice.items } },
      { status: IncomeStatuses.Unpaid },
      session,
    );

    const totalTax = await this.calculateTotalTax(invoiceId);
    const total = await this.calculateTotal(invoiceId);

    const updateResult = await this.invoiceRepository.updateById(
      invoiceId,
      {
        status: InvoiceStatuses.Canceled,
        updatedBy: activeUser.id,
        total,
        tax: totalTax,
      },
      session,
    );
    return updateResult;
  }

  async revertToPreviousState(
    revertInvoiceDto: RevertInvoiceDto,
    activeUser: ActiveUserData,
    session: ClientSession,
  ): Promise<UpdateWriteOpResult> {
    const { invoiceIds } = revertInvoiceDto;
    for (const invoiceId of invoiceIds) {
      const invoice: InvoiceDocument = await this.invoiceRepository.findById(
        invoiceId,
      );
      const now = new Date();

      if (now.getTime() <= invoice?.lock) {
        throw new ForbiddenException('Invoice is progressing');
      }
      if (
        invoice.status !== InvoiceStatuses.Issued &&
        invoice.status !== InvoiceStatuses.Pending
      ) {
        return;
      }

      await this.incomeService.updateMany(
        { _id: { $in: invoice.items } },
        { status: IncomeStatuses.Pending },
        session,
      );

      const previousStatus = invoice.issueNo
        ? InvoiceStatuses.Issued
        : InvoiceStatuses.Active;
      await this.updateById(
        invoiceId,
        {
          status: previousStatus,
          updatedBy: activeUser.id,
        },
        session,
      );
    }

    return;
  }

  async updateInvoice(
    invoiceId: string,
    updateInvoiceDto: UpdateInvoiceDto,
    activeUser: ActiveUserData,
    session?: ClientSession,
  ): Promise<InvoiceDocument> {
    const { issueNo, discount, duty, description } = updateInvoiceDto;

    const invoice: InvoiceDocument = await this.invoiceRepository.findById(
      invoiceId,
    );
    const now = new Date();

    if (now.getTime() <= invoice.lock) {
      throw new ForbiddenException('Invoice is progressing');
    }

    if (invoice.status !== InvoiceStatuses.Active) {
      throw new ForbiddenException('Invoice is not in active status!!');
    }

    if (issueNo && issueNo !== invoice.issueNo) {
      invoice.issueNo = issueNo;
      invoice.status = InvoiceStatuses.Issued;
      invoice.issuedBy = new mSchema.Types.ObjectId(activeUser.id);
      invoice.issuedAt = new Date();
      await this.incomeService.updateMany(
        { _id: { $in: invoice.items } },
        { status: IncomeStatuses.Pending },
        session,
      );
    }

    const updatePayload = {
      issueNo: invoice.issueNo,
      status: invoice.status,
      issuedBy: invoice.issuedBy,
      issuedAt: invoice.issuedAt,
      updatedBy: new mongoose.Types.ObjectId(activeUser.id),
      duty,
      description,
      discount,
    };

    await this.invoiceRepository.updateById(invoiceId, updatePayload, session);

    return invoice;
  }

  private async syncInstancesPaymentStatus(
    invoiceIds: string[],
    session?: ClientSession,
  ): Promise<void> {
    const allIncomeIds = [];
    let invoicePaymentStatus = null;
    const invoices = await this.invoiceRepository.findWithOutPagination({
      _id: { $in: invoiceIds },
    });
    invoices.forEach((invoice) => {
      allIncomeIds.push(...invoice.items);
    });
    const allIncomes = await this.incomeService.findWithOutPagination({
      _id: { $in: allIncomeIds },
    });

    const distinctInstanceIds = extractDistinctValues(allIncomes, 'instanceId');

    for (const instanceId of distinctInstanceIds) {
      if (instanceId === undefined || instanceId === 'undefined') {
        continue;
      }

      const unpaidIncome = await this.incomeService.findOne({
        instanceId,
        _id: { $nin: allIncomeIds },
        status: { $nin: [IncomeStatuses.Paid, IncomeStatuses.Canceled] },
      });

      if (unpaidIncome) {
        invoicePaymentStatus = InvoicePaymentStatuses.PARTIALLY_PAID;
      } else {
        invoicePaymentStatus = InvoicePaymentStatuses.PAID;
      }
      await this.processInstanceService.updateInstances(
        instanceId,
        {
          parameters: { InvoicePaymentStatus: invoicePaymentStatus },
        },
        { cascade: 'false' },
        session,
      );
    }
  }

  async getIncomesIdsByInstance(instanceId: string) {
    const data = await this.incomeService.findWithOutPagination({ instanceId });
    return data.map((d) => d._id);
  }

  async addOverdueCharge(activeUser: ActiveUserData, session?: ClientSession) {
    console.log('Starting invoice overdue calculation');
    const overdueInvoices = await this.invoiceRepository.findWithOutPagination({
      $and: [
        { expiryAt: { $exists: true } },
        { expiryAt: { $lt: new Date(getCurrentUtcDate()) } },
        {
          status: {
            $in: [
              InvoiceStatuses.Pending,
              InvoiceStatuses.Issued,
              InvoiceStatuses.Active,
            ],
          },
        },
      ],
    });

    /**
     * collect incomes together
     */
    const incomeIds = [];
    for (const invoice of overdueInvoices) {
      incomeIds.push(...invoice.items);
    }

    await this.incomeService.addOverdueCharge(incomeIds, activeUser, session);
  }

  async fillInvoiceRecipient(invoice: InvoiceDocument): Promise<IRecipient> {
    const invoiceRecord = await this.invoiceRepository.findById(
      invoice._id,
      'items',
    );

    //Free invoices
    if (invoiceRecord?.items[0]['type'] === IncomeTypes.Education) {
      if (!invoiceRecord.recipient.nationalCode) {
        throw new BadRequestException('Recipient information is not completed');
      }
      let dlCode = await this.financialService.getDlCodeByNationalCode(
        invoiceRecord.recipient.nationalCode,
      );

      if (!dlCode && dlCode == '0') {
        dlCode = await this.financialService.insertCustomerAndGetDlCode({
          address: invoiceRecord.recipient.address,
          contactNo: invoiceRecord.recipient.phone,
          isCustomer: true,
          name: invoiceRecord.recipient.name,
          lastname: invoiceRecord.recipient.lastname,
          nationalCode: invoiceRecord.recipient.nationalCode,
          type: invoiceRecord.recipient.type,
          postalCode: invoiceRecord.recipient.postalCode,
          code: null,
        });
      }

      invoice.recipient.financialId = dlCode;
      invoice.markModified('recipient');

      await invoice.save();
      return invoice.recipient;
    }
    if (!invoice?.recipient?.financialId) {
      const instance = await this.processInstanceService.findOnePublic(
        invoice?.items[0]['instanceId'],
        ['Buyer', 'Branch', 'Assignees', 'CaseType'],
      );
      //Try to find recipient financial Id again
      const recipient = await this.findInvoiceRecipient(instance);
      if (!recipient.financialId) {
        if (invoice.type === InvoiceTypes.Official) {
          const buyer = await this.buyerService.findById(
            invoice.recipient.refId,
          );
          if (!buyer.nationalCode) {
            throw new BadRequestException(
              'Recipient information is not completed',
            );
          }

          let dlCode = await this.financialService.getDlCodeByNationalCode(
            buyer.nationalCode,
          );

          if (!dlCode || dlCode == 0) {
            dlCode = await this.financialService.insertCustomerAndGetDlCode({
              address: buyer.address,
              contactNo: buyer.contactNo[0].split(':')[1],
              isCustomer: true,
              name: buyer.name || buyer?.metadata?.nameEn,
              lastname: '',
              nationalCode: buyer.nationalCode,
              type: buyer.type,
              code: null, //indicactor gozashte shavad
              postalCode: buyer.postalCode,
            });
          }

          recipient.financialId = dlCode;
          await this.buyerService.updateById(invoice.recipient.refId, {
            metadata: {
              ...buyer.metadata,
              sepidarId: dlCode,
            },
          });
        } else {
          const user = await this.userService.findById(invoice.recipient.refId);
          if (!user.nationalCode) {
            throw new BadRequestException(
              'Recipient information is not completed',
            );
          }

          let dlCode = await this.financialService.getDlCodeByNationalCode(
            user.nationalCode,
          );
          if (!dlCode || dlCode == 0) {
            dlCode = await this.financialService.insertCustomerAndGetDlCode({
              address: user.address,
              contactNo: user.phoneNo,
              isCustomer: user.type === 'personnel' ? false : true,
              name: user.name,
              lastname: user.lastname,
              nationalCode: user.nationalCode,
              type: 'natural',
              code: null, //indicactor gozashte shavad
              postalCode: user.postalCode,
            });
          }
          recipient.financialId = dlCode;
          await this.userService.updateById(user._id, { sepidarId: dlCode });
        }
      }
      invoice.recipient = recipient;
      await invoice.save();
    }

    if (invoice.recipient.financialId) {
      //Check if financialId is either stored in our system and financial system
      const data = await this.financialService.checkCustomerCode(
        invoice.recipient.financialId,
      );
      if (data == 0) {
        if (invoice.type === InvoiceTypes.Official) {
          const buyer = await this.buyerService.findById(
            invoice.recipient.refId,
          );
          await this.financialService.insertCustomerAndGetDlCode({
            address: buyer.address,
            contactNo: buyer.contactNo[0].split(':')[1],
            isCustomer: true,
            name: buyer.name,
            lastname: '',
            nationalCode: buyer.nationalCode,
            type: buyer.type,
            code: buyer.metadata.sepidarId,
            postalCode: buyer.postalCode,
          });
        } else {
          const user = await this.userService.findById(invoice.recipient.refId);

          await this.financialService.insertCustomerAndGetDlCode({
            address: user.address,
            contactNo: user.phoneNo,
            isCustomer: user.type === 'personnel' ? false : true,
            name: user.name,
            lastname: user.lastname,
            nationalCode: user.nationalCode,
            type: 'natural',
            code: null, //indicactor gozashte shavad
            postalCode: user.postalCode,
          });
        }
      }
    }
    return invoice.recipient;
  }

  async makeInvoiceManually(
    createInvoiceManuallyDto: CreateInvoiceManuallyDto,
    activeUser: ActiveUserData,
    session?: ClientSession,
  ) {
    let { instanceIds, recipient, isFor, type } = createInvoiceManuallyDto;
    if (!recipient?.financialId && !isFor) {
      throw new BadRequestException('Fill financialId');
    }
    const getQueryDto = new GetQueryDto();
    getQueryDto.props = 'CaseType,InspectionFeeInRial,Assignees,Branch';
    getQueryDto.size = null;
    getQueryDto.page = null;
    const filters = { _id: { $in: instanceIds } };
    getQueryDto.filters = JSON.stringify(filters);
    const { data: instances } = await this.processInstanceService.findAll(
      null,
      getQueryDto,
    );

    const caseNos = instances.map((instance) => instance.caseNo);

    //Checking all instances is official
    if (!type || type === InvoiceTypes.Official) {
      if (
        !objectValueIsTheSame(instances, 'parameters.CaseType') ||
        instances[0]?.parameters?.CaseType !== InstanceCaseTypes.Official
      ) {
        throw new ForbiddenException('some cases are not official');
      }
    }

    if (type && type === InvoiceTypes.Unofficial) {
      if (
        !objectValueIsTheSame(instances, 'parameters.CaseType') ||
        instances[0]?.parameters?.CaseType !== InstanceCaseTypes.Unofficial
      ) {
        throw new ForbiddenException('some cases are not unofficial');
      }
    }

    //All instances must be for one customer if recipient is not sent
    if (!recipient) {
      switch (isFor) {
        case 'buyer': {
          break;
        }
        case 'customer': {
          if (
            !objectValueIsTheSame(instances, 'parameters.Assignees.customer.id')
          ) {
            throw new ForbiddenException('All cases must be for one customer');
          }
          const user = await this.userService.findById(
            instances[0].parameters?.Assignees?.customer?.id,
          );

          recipient = {
            name: user.name,
            lastname: user.lastname,
            address: user.address,
            nationalCode: user.nationalCode,
            type: user.type,
            refId: user._id,
            economicCode: user.nationalCode,
            financialId: user.sepidarId,
            phone: user.phoneNo,
          };
          break;
        }
        case 'branch': {
          if (!objectValueIsTheSame(instances, 'parameters.Branch.managerId')) {
            throw new ForbiddenException('All cases must be for one branch');
          }
          const user = await this.userService.findById(
            instances[0].parameters?.Branch?.managerId,
          );

          recipient = {
            name: user.name,
            lastname: user.lastname,
            address: user.address,
            nationalCode: user.nationalCode,
            type: user.type,
            refId: user._id,
            economicCode: user.nationalCode,
            financialId: user.sepidarId,
            phone: user.phoneNo,
          };
          break;
        }
      }
    }

    const incomes = await this.incomeService.findWithOutPagination({
      instanceId: { $in: instanceIds },
      status: { $ne: IncomeStatuses.Canceled },
    });

    //All income must be unpaid
    if (
      !objectValueIsTheSame(incomes, 'status') ||
      incomes[0].status !== IncomeStatuses.Unpaid
    ) {
      throw new ForbiddenException('Some incomes are pending');
    }
    //All incomes should be in the same currency
    if (!objectValueIsTheSame(incomes, 'currency')) {
      throw new ForbiddenException('Currencies should be in the same type');
    }

    /**
     * # Checks are completed let's create invoice
     */

    const incomeIds = incomes.map((income) => income._id);

    const invoice: any = {};

    invoice.title = 'صورت حساب فروش کالا و خدمات';
    invoice.description = caseNos.join(' - ');
    let expiryAt = getCurrentUtcDate();

    if (incomes[0].currency !== currencies.Rial) {
      expiryAt = addDays(expiryAt, 5);
    } else {
      expiryAt = addDays(expiryAt, 60);
    }
    invoice.expiryAt = new Date(expiryAt);

    invoice.recipient = recipient;
    const items = incomes.map((income) => income._id);
    invoice.items = items;
    invoice.createdBy = activeUser.id;
    invoice.updatedBy = activeUser.id;
    invoice.type = type;

    const invoiceNo = await this.indicatorService.findByKeyAndIncrement(
      'invoice',
    );

    invoice.invoiceNo = invoiceNo;
    await this.incomeService.updateMany(
      { _id: { $in: incomeIds } },
      { status: IncomeStatuses.Pending },
      session,
    );
    await this.invoiceRepository.create(invoice, session);
    return invoice;
  }

  async forceUpdate(
    invoiceId: string,
    forceUpdateDto: ForceUpdateDto,
    session?: ClientSession,
  ) {
    const { activeUser, financialDocumentId, issueNo, items } = forceUpdateDto;
    const invoice = await this.invoiceRepository.findById(invoiceId);
    const updatePayload: any = {};

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }
    const now = new Date();

    if (now.getTime() <= invoice.lock) {
      throw new ForbiddenException('Invoice is progressing');
    }

    if (invoice.financialDocumentId && !financialDocumentId) {
      throw new BadRequestException('cannot leave docId blank');
    }

    if (invoice.issueNo && !issueNo) {
      throw new BadRequestException('cannot leave issueNo blank');
    }

    //#region Validations
    // let sameIssueNumber = await this.invoiceRepository.findOne({
    //   $and: [
    //     { _id: { $ne: invoiceId } },
    //     { issueNo },
    //     { issueNo: { $exists: true } },
    //     { issueNo: { $ne: null } },
    //   ],
    // });

    // if (sameIssueNumber) {
    //   throw new ForbiddenException('issueNo exists');
    // }
    const sameFinancialDocumentId = await this.invoiceRepository.findOne({
      $and: [
        { _id: { $ne: invoiceId } },
        { financialDocumentId },
        { financialDocumentId: { $exists: true } },
        { financialDocumentId: { $ne: null } },
      ],
    });
    if (sameFinancialDocumentId) {
      throw new ForbiddenException('financialDocument exists');
    }
    //#endregion validation

    //Find differences in items
    const { added, deleted } = this.itemsDifferences(
      invoice.items.map((item) => item.toString()),
      items,
    );

    await this.incomeService.updateMany(
      { _id: { $in: deleted } },
      { status: IncomeStatuses.Unpaid, updatedBy: activeUser.id },
    );
    const deletedIncomes = await this.incomeService.findWithOutPagination({
      _id: { $in: deleted },
    });
    for (const deletedIncome of deletedIncomes) {
      await this.processInstanceService.updateInstances(
        deletedIncome.instanceId.toString(),
        {
          parameters: { InvoicePaymentStatus: InvoicePaymentStatuses.UNPAID },
        },
        { cascade: 'false' },
      );
    }

    //Added incomes should be unpaid
    const addedPaidIncomes = await this.incomeService.findWithOutPagination({
      $id: { $in: added },
      status: { $ne: IncomeStatuses.Unpaid },
    });
    if (addedPaidIncomes.length > 0) {
      throw new ForbiddenException('Added incomes are not able to add');
    }

    let invoiceStatus = invoice.status;
    if (issueNo) {
      invoiceStatus = InvoiceStatuses.Issued;
      if (financialDocumentId) {
        invoiceStatus = InvoiceStatuses.Paid;
      }
    }

    let incomesStatus = IncomeStatuses.Pending;
    if (invoiceStatus === InvoiceStatuses.Paid) {
      incomesStatus = IncomeStatuses.Paid;
    }

    await this.incomeService.updateMany(
      { _id: { $in: added } },
      { status: incomesStatus },
    );
    await this.invoiceRepository.updateById(invoiceId, {
      ...forceUpdateDto,
      status: invoiceStatus,
      updatedBy: forceUpdateDto.activeUser.id,
    });

    await this.syncInstancesPaymentStatus([invoiceId]);
  }

  itemsDifferences(
    items1: string[],
    items2: string[] | undefined | null,
  ): { deleted: string[]; added: string[] } {
    if (!items2) {
      return { added: [], deleted: [] };
    }
    const oldSet = new Set(items1);
    const newSet = new Set(items2);

    const added = [...newSet].filter((item) => !oldSet.has(item));
    const deleted = [...oldSet].filter((item) => !newSet.has(item));

    return { added, deleted };
  }

  async expiryAlert() {
    const now = new Date();
    const alertDate = addDays(
      now.toString(),
      parseInt(this.appConfigService.invoiceExpiryAlertThreshold),
    );
    const invoices = await this.invoiceRepository.findWithOutPagination(
      {
        $or: [
          { status: InvoiceStatuses.Active },
          { status: InvoiceStatuses.Pending },
          { status: InvoiceStatuses.Issued },
        ],
        expiryAt: new Date(alertDate),
      },
      'items',
    );

    for (const invoice of invoices as any) {
      const encryptedInvoice = encrypt(
        invoice.id,
        this.appConfigService.invoiceCryptoSecretKey,
      );
      const invoiceAmount: number = invoice.items.reduce(
        (sum, income) => sum + income.total + income.tax,
        0,
      );

      if (
        invoice.type === InvoiceTypes.Unofficial &&
        invoice?.recipient?.phone
      ) {
        this.queueService.invoiceExpiryAlert({
          remainingTime: this.appConfigService.invoiceExpiryAlertThreshold,
          phoneNo: invoice.recipient.phone,
          invoiceAmount,
          invoiceNo: invoice.invoiceNo,
          encryptedInvoice,
        });
      }
      if (invoice.type === InvoiceTypes.Official) {
        const isCaseNoEqual: boolean = invoice.items.every(
          (item) => item.caseNo === invoice.items[0].caseNo,
        );
        if (isCaseNoEqual) {
          const customerId = (
            await this.processInstanceService.findOne(
              invoice.items[0].instanceId,
              ['Assignees'],
            )
          ).parameters?.Assignees?.customer?.id;
          const user = await this.userService.findOne(
            { _id: customerId },
            'phoneNo',
          );
          if (user?.phoneNo) {
            this.queueService.invoiceExpiryAlert({
              remainingTime: this.appConfigService.invoiceExpiryAlertThreshold,
              phoneNo: user.phoneNo,
              invoiceAmount,
              invoiceNo: invoice.invoiceNo,
              encryptedInvoice,
            });
          }
        } else {
          const customersId = [];
          for (const income of invoice.items) {
            const customer = (
              await this.processInstanceService.findOne(income.instanceId, [
                'Assignees',
              ])
            ).parameters.Assignees.customer.id;

            customersId.push(customer);
          }
          const isCustomerEqual: boolean = customersId.every(
            (item) => item === item[0],
          );
          if (isCustomerEqual) {
            const user = await this.userService.findOne(
              { _id: customersId[0] },
              'phoneNo',
            );
            if (user?.phoneNo) {
              this.queueService.invoiceExpiryAlert({
                remainingTime:
                  this.appConfigService.invoiceExpiryAlertThreshold,
                phoneNo: user.phoneNo,
                invoiceAmount,
                invoiceNo: invoice.invoiceNo,
                encryptedInvoice,
              });
            }
          }
        }
      }
    }
  }
  async notifySms(invoiceId: string, phoneNo: string) {
    const { amount, invoiceNo } = await this.calculateTotalWithTax(invoiceId);
    const encryptId = this.encryptInvoice(invoiceId);
    await this.smsService.sendSmsDynamicTemplateAndParamters(
      phoneNo,
      '355424',
      [
        { name: 'AMOUNT', value: amount },
        { name: 'INVOICENO', value: invoiceNo },
        { name: 'ID', value: encryptId },
      ],
    );
  }
  encryptInvoice(invoiceId: string) {
    return encrypt(invoiceId, this.appConfigService.invoiceCryptoSecretKey);
  }
}
