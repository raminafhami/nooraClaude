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
  Put,
} from '@nestjs/common';
import { ContractService } from './contract.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { GetQueryDto } from 'src/shared/crud/dto/get-query.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CheckPermissions } from '../iam/authentication/decorators/permissions.decorator';
import { PermissionAction, Subjects } from '../iam/authentication/enums';
import { PersonnelService } from '../personnel/personnel.service';
import { VerifyContractCodeDto } from './dto/verify-contract-code.dto';
import { UsersService } from '../users/services/users.service';
import { ActiveUser } from '../iam/authentication/decorators/active-user.decorator';
import { ActiveUserData } from '../iam/authentication/interfaces/active-user-data.interface';

@ApiTags('contract')
@ApiBearerAuth('token')
@Controller('contract')
export class ContractController {
  constructor(
    private readonly contractService: ContractService,
    private readonly personnelService: PersonnelService,
    private readonly userService: UsersService,
  ) {}

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.CONTRACT,
  })
  @Post()
  async create(@Body() createContractDto: CreateContractDto) {
    const contract = await this.contractService.create(createContractDto);

    return contract;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.CONTRACT,
  })
  @Get()
  async findAll(@Query() queryDto: GetQueryDto) {
    const data = await this.contractService.findWithAggregation(queryDto);
    return data;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.CONTRACT,
  })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const contract = await this.contractService.findById(id, [
      'user',
      { path: 'jobs', select: '_id name code department metadata' },
    ]);
    if (!contract) {
      throw new NotFoundException('contract not exist');
    }
    const personnel = await this.personnelService.findOne(
      {
        userId: contract.userId,
      },
      '_id fatherName birthDate birthPlace academics address landlineNo',
    );
    return {
      ...personnel.toJSON(),
      ...contract.toJSON(),
      personnelId: personnel.id,
    };
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.CONTRACT,
  })
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateContractDto: UpdateContractDto,
  ) {
    const newContract = await this.contractService.findByIdAndUpdate(
      id,
      updateContractDto,
    );
    if (!newContract) {
      throw new NotFoundException('contract not exist');
    }
    return newContract;
  }

  @CheckPermissions({
    action: PermissionAction.DELETE,
    subject: Subjects.CONTRACT,
  })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const checkDeleted = await this.contractService.deleteById(id);
    if (!checkDeleted) {
      throw new NotFoundException('contract not exist.');
    }
  }

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.CONTRACT,
  })
  @Post('verify-contract-code')
  async verifyContractCode(
    @Body() verifyContractCodeDto: VerifyContractCodeDto,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    const user = await this.userService.findById(activeUser.id);
    return await this.contractService.verifyContractCode({
      ...verifyContractCodeDto,
      phone: user.phoneNo,
    });
  }
}
