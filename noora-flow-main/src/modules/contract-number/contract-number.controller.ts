import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { ContractNumberService } from './contract-number.service';
import { CreateContractNumberDto } from './dto/create-contract-number.dto';
import { UpdateContractNumberDto } from './dto/update-contract-number.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CheckPermissions } from '../iam/authentication/decorators/permissions.decorator';
import { PermissionAction, Subjects } from '../iam/authentication/enums';
import { ActiveUserData } from '../iam/authentication/interfaces/active-user-data.interface';
import { ActiveUser } from '../iam/authentication/decorators/active-user.decorator';
import { GetQueryDto } from '../process-instances/dtos';

@ApiTags('contract-number')
@ApiBearerAuth('token')
@Controller('contract-number')
export class ContractNumberController {
  constructor(private readonly contractNumberService: ContractNumberService) {}

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.CONTRACT_NUMBER,
  })
  @Post()
  async create(
    @ActiveUser() activeUser: ActiveUserData,
    @Body() createContractNumberDto: CreateContractNumberDto,
  ) {
    const CN = await this.contractNumberService.createCN({
      ...createContractNumberDto,
      branchId:
        activeUser.branchId == null
          ? '67fe755a7ce42f0991088d91'
          : activeUser.branchId,
      createdBy: activeUser.id,
    });
    return CN;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.CONTRACT_NUMBER,
  })
  @Get()
  async findAll(@Query() queryDto: GetQueryDto) {
    const data = await this.contractNumberService.findAll(queryDto);
    return data;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.CONTRACT_NUMBER,
  })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const contractNumber = await this.contractNumberService.findById(id);
    if (!contractNumber) {
      throw new NotFoundException('contract number not exist');
    }
    return contractNumber;
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.CONTRACT_NUMBER,
  })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateContractNumberDto: UpdateContractNumberDto,
  ) {
    const newContractNumber =
      await this.contractNumberService.findByIdAndUpdate(
        id,
        updateContractNumberDto,
      );
    if (!newContractNumber) {
      throw new NotFoundException('contract number not exist');
    }
    return newContractNumber;
  }

  @CheckPermissions({
    action: PermissionAction.DELETE,
    subject: Subjects.CONTRACT_NUMBER,
  })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const checkDeleted = await this.contractNumberService.softDeleteById(id);
    if (!checkDeleted) {
      throw new NotFoundException('contract number not exist.');
    }
  }
}
