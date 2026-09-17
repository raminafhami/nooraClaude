import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { FinancialService } from './financial.service';
import { SubmitFinancialDto } from './dto/submit-financial.dto';
import { BuyerService } from '../users/services/buyer.service';
import { InsertVoucherDto } from './dto/insert-voucher.dto';
import { InsertInvoiceDto } from './dto/insert-invoice.dto';
import { InsertCustomerDto } from './dto/insert-customer.dto';

@Controller('financial')
export class FinancialController {
  constructor(
    private readonly financialService: FinancialService,
    private readonly buyerService: BuyerService,
  ) {}

  @Post('submit')
  async submitSepidar(@Body() data: SubmitFinancialDto) {
    const result = await this.financialService.submit(data);
    return result;
  }

  @Post('voucher')
  async insertVoucher(@Body() data: InsertVoucherDto) {
    const result = await this.financialService.insertVouchers(data);
    return result;
  }

  @Post('invoice')
  async insertInvoice(@Body() data: InsertInvoiceDto) {
    const result = await this.financialService.insertInvoice(data);
    return result;
  }

  @Post('customer')
  async insertCustomer(@Body() data: InsertCustomerDto) {
    let DlCode = await this.financialService.getDlCodeByNationalCode(
      data.nationalCode,
    );
    if (DlCode) {
      throw new BadRequestException(
        'The customer with this nationalCode is already registered',
      );
    }

    DlCode = await this.financialService.insertCustomerAndGetDlCode(data);

    return { DlCode };
  }

  @Get('customer/:nationalCode/check')
  async checkExist(@Param('nationalCode') nationalCode: string) {
    const DlCode = await this.financialService.getDlCodeByNationalCode(
      nationalCode,
    );
    return {
      DlCode,
    };
  }
}
