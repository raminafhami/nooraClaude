import {
  Controller,
  Post,
  Body,
  Param,
  Res,
  Req,
  Get,
  Redirect,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { ActiveUser } from '../iam/authentication/decorators/active-user.decorator';
import { ActiveUserData } from '../iam/authentication/interfaces/active-user-data.interface';
import { encrypt } from 'src/common/utils/crypto';
import { AppConfigService } from 'src/config/app/config.service';

@ApiTags('payment')
@ApiBearerAuth('token')
@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly appConfigService: AppConfigService,
  ) {}

  // @Post()
  // async create(@Body() createPaymentDto: CreatePaymentDto) {
  //   return await this.paymentService.create(createPaymentDto);
  // }

  // @CheckPermissions({
  //   action: PermissionAction.CREATE,
  //   subject: Subjects.PAYMENTS,
  // })
  @Post('/pay/:invoiceId')
  async pay(
    @ActiveUser() activeUser: ActiveUserData,
    @Res() res: Response,
    @Param('invoiceId') invoiceId: string,
  ) {
    let page = await this.paymentService.pay(invoiceId, activeUser);
    return res.send(page);
  }

  // @Redirect()
  @Post('/verify')
  async verify(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const payment = await this.paymentService.verify(body, req['mongoSession']);

    const redirectUrl = `http://192.168.120.143:3000/payment/${encrypt(
      payment.invoiceId.toString(),
      this.appConfigService.invoiceCryptoSecretKey,
    )}?success=${payment.isVerified}`;
    return res.redirect(redirectUrl);
    // return { url: redirectUrl };
  }

  @Get(':paymentId')
  async get(@Param() paymentId: string) {
    return this.paymentService.findById(paymentId);
  }

  @Post('test/test/etestse/df/etsfgs')
  async test(@ActiveUser() activeUser: ActiveUserData) {
    return this.paymentService.pay('67ab48a107372dff73c4455c', activeUser);
  }

  @Get(':paymentId')
  async getOne(@Param('paymentId') paymentId: string) {
    return await this.paymentService.findById(paymentId);
  }
}
