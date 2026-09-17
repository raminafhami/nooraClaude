import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { CrudService } from 'src/shared/crud/service/crud.service';
import {
  Payment,
  PaymentDocument,
  TRANSACTION_TYPES,
} from './schemas/payment.schema';
import { PaymentRepositoryImpl } from './repositories/payment.repository';
import { IKCVerifyDto } from './dto/ikc-verify.dto';
import * as crypto from 'crypto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { BankGatewayConfigService } from 'src/config/bank-gateway/config.service';
import { InvoiceService } from '../invoice/invoice.service';
import { InvoiceStatuses, PaymentStatuses } from 'src/common/const/enums';
import { IncomeService } from '../income/income.service';
import { ActiveUserData } from '../iam/authentication/interfaces/active-user-data.interface';
import { decrypt, encrypt } from 'src/common/utils/crypto';
import { AppConfigService } from 'src/config/app/config.service';
import { plainToClass } from 'class-transformer';
import { ClientSession } from 'mongoose';
import { getCurrentUtcDate } from 'src/common/providers/moment-date';

interface IKCInterface {
  transactionType?: string;
  amount: number;
  requestId: string;
  paymentId: string;
}

@Injectable()
export class PaymentService extends CrudService<PaymentDocument> {
  constructor(
    private paymentRepositoryImpl: PaymentRepositoryImpl,
    private readonly httpService: HttpService,
    private readonly bankGatewayConfigService: BankGatewayConfigService,
    private readonly invoiceService: InvoiceService,
    private readonly incomeService: IncomeService,
    private readonly appConfigService: AppConfigService,
  ) {
    super(paymentRepositoryImpl);
  }

  async pay(invoiceId: string, activeUser: ActiveUserData) {
    const now = new Date();

    const decryptedInvoiceId = decrypt(
      invoiceId,
      this.appConfigService.invoiceCryptoSecretKey,
    );
    const invoice = await this.invoiceService.findById(
      decryptedInvoiceId,
      'items',
    );
    if (
      !invoice ||
      invoice.status === InvoiceStatuses.Canceled ||
      invoice.status === InvoiceStatuses.Paid ||
      invoice.status === InvoiceStatuses.Pending
    ) {
      throw new NotFoundException('Invoice not found');
    }
    if (now.getTime() <= invoice.lock) {
      throw new ForbiddenException('Invoice is progressing');
    }
    let totalAmount = 0;
    totalAmount = invoice.items.reduce(
      (acc, cur) => cur['total'] + cur['tax'] + acc,
      totalAmount,
    );
    /**
     * !
     * If invoice amount is -0- it should not be submit on financial system
     */
    if (totalAmount === 0) {
      //TODO
    }
    const tenMinutesLater = new Date(now.getTime() + 10 * 60 * 1000);

    //Lock invoice and incomes to do not modify until 15 minutes or fail transaction
    await this.incomeService.updateMany(
      { _id: { $in: invoice.items } },
      { lock: tenMinutesLater.getTime() },
    );
    await this.invoiceService.updateById(decryptedInvoiceId, {
      lock: tenMinutesLater.getTime(),
    });

    //Generate random number for paymentId
    const max = 10 ** 18;
    const randomNum = Math.random() * max;
    const stringNum = randomNum.toFixed(0);
    //Create payment record
    const payment = await this.paymentRepositoryImpl.create({
      amount: totalAmount,
      transActionType: TRANSACTION_TYPES.PURCHASE,
      terminalId: this.bankGatewayConfigService.terminalId,
      acceptorId: this.bankGatewayConfigService.acceptorId,
      bankPaymentId: stringNum,
      requestId: invoice.invoiceNo,
      requestTimestamp: Math.floor(Date.now() / 1000),
      revertUri: this.bankGatewayConfigService.revertUri,
      isVerified: false,
      invoiceId: invoice._id,
      status: PaymentStatuses.PROGRESSING,
      createdBy: activeUser?.id,
      invoiceType: invoice.type,
    });

    const token = await this.getBankGatewayTokenConfig({
      amount: totalAmount,
      paymentId: stringNum,
      requestId: invoice.invoiceNo,
    });

    const page = await this.createIPGPage(token);
    return page;
  }

  async verify(ikcVerifyDto: IKCVerifyDto, session: ClientSession) {
    let payment: PaymentDocument;

    //Cancel payment
    if (ikcVerifyDto.responseCode === '17') {
      payment = await this.paymentRepositoryImpl.findOneAndUpdate(
        {
          bankPaymentId: ikcVerifyDto.paymentId,
          requestId: ikcVerifyDto.requestId,
        },
        {
          isVerified: false,
          status: PaymentStatuses.CANCELED,
        },
        false,
        session,
      );
      let invoice = await this.invoiceService.findByIdAndUpdate(
        payment.invoiceId,
        {
          $unset: { lock: 1 },
        },
        session,
      );
      await this.incomeService.updateMany(
        { _id: { $in: invoice.items } },
        { $unset: { lock: 1 } },
        session,
      );
    } else if (ikcVerifyDto.responseCode == '00') {
      const result = await this.confirmPayment(ikcVerifyDto);
      console.log('payment Result: ', result);

      if (result?.status === true) {
        payment = await this.paymentRepositoryImpl.findOneAndUpdate(
          {
            bankPaymentId: ikcVerifyDto.paymentId,
            requestId: ikcVerifyDto.requestId,
          },
          {
            isVerified: true,
            status: PaymentStatuses.COMPLETED,
            retrievalReferenceNumber: ikcVerifyDto.retrievalReferenceNumber,
            systemTraceAuditNumber: ikcVerifyDto.systemTraceAuditNumber,
          },
          false,
          session,
        );
        const invoice = await this.invoiceService.findById(payment.invoiceId);
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Ensure two digits
        const day = String(date.getDate()).padStart(2, '0'); // Ensure two digits
        let currentDate = `${year}/${month}/${day}`;

        await this.invoiceService.makeInvoicePaid(
          {
            date: currentDate,
            invoiceIds: [invoice._id.toString()],
            trackingCode: payment.systemTraceAuditNumber,
            dlCode: '020',
            slCode: '111005',
          },
          {
            id: '64fc34ccac4d2e3326f95a5d',
            fullName: 'IKCUser',
            groups: [],
            branchId: '',
            email: '',
            phoneNo: '',
            type: 'system',
          },
          session,
        );
      }
    }
    return payment;
  }

  async confirmPayment(verifyDto: IKCVerifyDto) {
    const config = {} as any;
    config.method = 'POST';

    config.url = 'https://ikc.shaparak.ir/api/v3/confirmation/purchase';
    config.data = {
      terminalId: this.bankGatewayConfigService.terminalId,
      retrievalReferenceNumber: verifyDto.retrievalReferenceNumber,
      systemTraceAuditNumber: verifyDto.systemTraceAuditNumber,
      tokenIdentity: verifyDto.token,
    };

    const result = await firstValueFrom(this.httpService.request(config));
    return result.data;
  }

  async getBankGatewayTokenConfig(paymentData: IKCInterface) {
    const { transactionType, amount } = paymentData;
    const config = {} as any;
    config.method = 'POST';
    const authenticationEnvelope = this.generateAuthenticationEnvelope(
      amount,
      this.bankGatewayConfigService.terminalId,
      this.bankGatewayConfigService.passPhrase,
    );

    config.url = 'https://ikc.shaparak.ir/api/v3/tokenization/make';
    config.data = {
      request: {
        transactionType: TRANSACTION_TYPES.PURCHASE,
        terminalId: this.bankGatewayConfigService.terminalId,
        acceptorId: this.bankGatewayConfigService.acceptorId,
        amount,
        revertUri: this.bankGatewayConfigService.revertUri,
        requestId: paymentData.requestId, //it should generate randomly
        paymentId: paymentData.paymentId, //it should generate randomly
        requestTimestamp: Math.floor(Date.now() / 1000),
      },
      authenticationEnvelope,
    };

    const result = await firstValueFrom(this.httpService.request(config));

    return result.data.result.token;
  }

  async createIPGPage(token: string) {
    const html = `<form id="formIPG" method="post" action="https://ikc.shaparak.ir/iuiv3/IPG/Index/" enctype=multipart/form-data" style="display:none !important;"  >
										<input type="hidden"  name="tokenIdentity" value="${token}" />
										<input type="submit" value="Pay"/>
									</form>
									<script language="JavaScript" type="text/javascript">
										document.getElementById("formIPG").submit();
									</script>`;

    return html;
  }

  private generateAuthenticationEnvelope(
    amount: number,
    terminalId: string,
    passPhrase: string,
  ) {
    const zeroPadAmount = amount.toString().padStart(12, '0');
    const inputStr = `${terminalId}${passPhrase}${zeroPadAmount}00`;

    const aesSecretKey = crypto.randomBytes(16);
    const aesInitialVector = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      'aes-128-cbc',
      Buffer.from(aesSecretKey),
      aesInitialVector,
    );
    const aesEncrypted = Buffer.concat([
      cipher.update(Buffer.from(inputStr, 'hex')),
      cipher.final(),
    ]);

    const aesEncryptedHash = crypto
      .createHash('sha256')
      .update(aesEncrypted)
      .digest();

    const rsaEncrypted = crypto.publicEncrypt(
      {
        key: process.env.IKC_PUBLIC_KEY,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      Buffer.from(Buffer.concat([aesSecretKey, aesEncryptedHash])),
    );

    return {
      data: rsaEncrypted.toString('hex'),
      iv: aesInitialVector.toString('hex'),
    };
  }
}
