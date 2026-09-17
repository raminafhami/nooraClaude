import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IncomeService } from './income.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { ActiveUser } from '../iam/authentication/decorators/active-user.decorator';
import { ActiveUserData } from '../iam/authentication/interfaces/active-user-data.interface';
import { ProcessInstanceService } from '../process-instances/process-instances.service';
import { ProcessDefinitionDocument } from '../process-definitions/schemas/process-definitions.schema';
import { ProcessInstanceDocument } from '../process-instances/schemas/process-instances.schema';
import { PermissionAction, Subjects } from '../iam/authentication/enums';
import { CheckPermissions } from '../iam/authentication/decorators/permissions.decorator';
import { GetQueryDto } from 'src/shared/crud/dto/get-query.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { Request } from 'express';
import { IncomeStatuses } from 'src/common/const/enums';
import { today } from 'src/common/utils/data.util';
import { ChangeCaseTypeDto } from './dto/change-case-type.dto';
import { ForceUpdateIncomeDto } from './dto/force-update-income.dto';
import { GroupsGuard } from 'src/common/guards/groups.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('income')
@ApiTags('Income')
@ApiBearerAuth('token')
export class IncomeController {
  constructor(private readonly incomeService: IncomeService) {}

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.INCOMES,
  })
  @Post()
  async create(
    @Body() createIncomeDto: CreateIncomeDto,
    @ActiveUser() activeUser: ActiveUserData,
    @Req() request: Request,
  ) {
    return await this.incomeService.createIncome(
      createIncomeDto,
      activeUser,
      request['mongoSession'],
    );
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.INCOMES,
  })
  @Get()
  async findAll(@Query() getQueryDto: GetQueryDto) {
    return await this.incomeService.findAll(getQueryDto);
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.INCOMES,
  })
  @Patch('/change-case-type')
  async changeCaseType(
    @Body() changeCaseTypeDto: ChangeCaseTypeDto,
    @ActiveUser() activeUser: ActiveUserData,
    @Req() req: Request,
  ) {
    return this.incomeService.changeCaseType(
      changeCaseTypeDto,
      activeUser,
      req['mongoSession'],
    );
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.INCOMES,
  })
  @Roles(['system-admin', 'financial-expert', 'ceo', 'finance'])
  @UseGuards(GroupsGuard)
  @Patch('force-update/:incomeId')
  async forceUpdateIncome(
    @Param('incomeId') incomeId: string,
    @Body() forceUpdateIncomeDto: ForceUpdateIncomeDto,
    @ActiveUser() activeUser: ActiveUserData,
    @Req() req: Request,
  ) {
    forceUpdateIncomeDto.activeUser = activeUser;
    return this.incomeService.forceUpdate(
      incomeId,
      forceUpdateIncomeDto,
      req['mongoSession'],
    );
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.INCOMES,
  })
  @Patch(':id')
  async update(
    @Param('id') incomeId: string,
    @Body() updateIncomeDto: UpdateIncomeDto,
    @ActiveUser() activeUser: ActiveUserData,
    @Req() request: Request,
  ) {
    const income = await this.incomeService.findById(incomeId);

    if (income.status !== IncomeStatuses.Unpaid) {
      throw new ForbiddenException('You cannot edit this record');
    }

    return await this.incomeService.updateIncome(
      incomeId,
      {
        ...updateIncomeDto,
        activeUser: activeUser,
      },
      request['mongoSession'],
    );
  }

  @CheckPermissions({
    action: PermissionAction.DELETE,
    subject: Subjects.INCOMES,
  })
  @Delete(':incomeId')
  async delete(
    @Param('incomeId') incomeId: string,
    @ActiveUser() activeUser: ActiveUserData,
    @Req() req: Request,
  ) {
    return this.incomeService.remove(incomeId, activeUser, req['mongoSession']);
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.INCOMES,
  })
  @Get('test/income/test')
  async addCharge() {}
}
