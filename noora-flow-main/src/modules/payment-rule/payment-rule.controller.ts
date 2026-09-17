import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  BadRequestException,
  NotFoundException,
  Put,
} from '@nestjs/common';
import { PaymentRuleService } from './payment-rule.service';
import { CreatePaymentRuleDto } from './dto/create-payment-rule.dto';
import { UpdatePaymentRuleDto } from './dto/update-payment-rule.dto';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { GetQueryDto } from 'src/shared/crud/dto/get-query.dto';
import { CheckPermissions } from '../iam/authentication/decorators/permissions.decorator';
import { PermissionAction, Subjects } from '../iam/authentication/enums';

@ApiTags('payment-rule')
@ApiBearerAuth('token')
@Controller('payment-rule')
export class PaymentRuleController {
  constructor(private readonly paymentRuleService: PaymentRuleService) {}

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.PAYMENT_RULE,
  })
  @Post()
  async create(@Body() createPaymentRuleDto: CreatePaymentRuleDto) {
    const paymentRule = await this.paymentRuleService.create(
      createPaymentRuleDto,
    );
    return paymentRule;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.PAYMENT_RULE,
  })
  @Get()
  async findAll(@Query() queryDto: GetQueryDto) {
    const data = await this.paymentRuleService.findAll(queryDto);
    return data;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.PAYMENT_RULE,
  })
  @ApiQuery({ name: 'populate', type: 'string', required: false })
  @Get(':id')
  async findOne(@Param('id') id: string, @Query('populate') populate: string) {
    const paymentRule = await this.paymentRuleService.findById(id, populate);
    if (!paymentRule) throw new BadRequestException('payment rule not exist.');
    return paymentRule;
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.PAYMENT_RULE,
  })
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePaymentRuleDto: UpdatePaymentRuleDto,
  ) {
    const newPaymentRule = await this.paymentRuleService.findByIdAndUpdate(
      id,
      updatePaymentRuleDto,
    );

    if (!newPaymentRule)
      throw new BadRequestException('payment rule not exist.');
    return newPaymentRule;
  }

  @CheckPermissions({
    action: PermissionAction.DELETE,
    subject: Subjects.PAYMENT_RULE,
  })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const checkDeleted = await this.paymentRuleService.deleteById(id);
    if (!checkDeleted) {
      throw new NotFoundException('payment rule not exist');
    }
  }
}
