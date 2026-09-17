import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  Put,
  Query,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './services/users.service';
import { CreateUserDto } from './dto/create-user.dto';
import {
  AddBankInfoDto,
  EditBankInfoDto,
  UpdateUserDto,
  UpdateUserLoginTypeDto,
} from './dto/update-user.dto';
import { ApiBearerAuth, ApiBody, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { BuyerService } from './services/buyer.service';
import { GetQueryDto } from 'src/shared/crud/dto/get-query.dto';
import { GetQueryDto as GetQuery } from 'src/modules/process-instances/dtos/index';
import { CreateBuyerDto } from './dto/create-buyer.dto';
import { UpdateBuyerDto } from './dto/update-buyer.dto';
import { CheckPermissions } from '../iam/authentication/decorators/permissions.decorator';
import { PermissionAction, Subjects } from '../iam/authentication/enums';
import { ActiveUserData } from '../iam/authentication/interfaces/active-user-data.interface';
import { ActiveUser } from '../iam/authentication/decorators/active-user.decorator';
import { UpdateUserCreditDto } from './dto/update-user-credit.dto';
import { DebtService } from './services/debt.service';
import { CreateDebtDto } from './dto/create-debt.dto';
import { DebtDocument } from './schemas/debt.schema';
import { CreateUserBuyerDto } from './dto/create-user-buyer.dto';
import { ProcessInstanceService } from '../process-instances/process-instances.service';

@ApiTags('users & buyer')
@ApiBearerAuth('token')
@ApiSecurity('x-api-key')
@Controller()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly buyerService: BuyerService,
    private readonly debtService: DebtService,
    private readonly instanceService: ProcessInstanceService,
  ) {}

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.USER,
  })
  @Post('users/create-user')
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    const { user } = await this.usersService.createUserByAdmin({
      ...createUserDto,
      createdBy: activeUser.id,
    });
    return user;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.USER,
  })
  @Get('users')
  async findAllUsers(@Query() queryDto: GetQueryDto) {
    // queryDto.projection = {
    //   fullName: {
    //     $concat: ['$name', ' ', '$lastname'],
    //   },
    //   name: 1,
    //   lastname: 1,
    //   groups: 1,
    //   branchId: 1,
    //   nationalCode: 1,
    //   username: 1,
    //   email: 1,
    //   phoneNo: 1,
    //   type: 1,
    //   metadata: 1,
    // };
    const users = await this.usersService.findAll(queryDto);
    return users;
  }

  @CheckPermissions({
    action: PermissionAction.READ_OWN,
    subject: Subjects.USER,
  })
  @Get('users/active')
  async activeUser(@ActiveUser() activeUser: ActiveUserData) {
    return await this.usersService.findById(activeUser.id);
  }

  @CheckPermissions({
    action: PermissionAction.READ_OWN,
    subject: Subjects.USER,
  })
  @Get('users/permissions')
  async getUserPermissions(@ActiveUser() user: ActiveUserData) {
    const permissions = await this.usersService.findAllPermissions(user.id);
    return permissions;
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.USER,
  })
  @Patch('users/change-logintype')
  async updateLoginType(
    @ActiveUser() user: ActiveUserData,
    @Body() { loginType }: UpdateUserLoginTypeDto,
  ) {
    const newUser = await this.usersService.findByIdAndUpdate(user.id, {
      loginType,
    });
    return newUser;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.USER,
  })
  @Get('users/:id')
  async findOneUser(@Param('id') id: string) {
    const user = await this.usersService.findById(id, [
      {
        path: 'groups',
        select: 'type name title',
      },
      'userFiles',
      { path: 'industryId' },
      { path: 'subIndustryId' },
      'branchId',
      'personnel'

    ]);
    if (!user) {
      throw new NotFoundException('user not exist.');
    }
    return user;
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.USER,
  })
  @Put('users/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    if (updateUserDto?.password) {
      updateUserDto.password = await this.usersService.hashPassword(
        updateUserDto.password,
      );
    }
    const newUser = await this.usersService.findByIdAndUpdate(
      id,
      updateUserDto,
    );
    if (!newUser) {
      throw new NotFoundException('user not exist.');
    }
    return newUser;
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.USER,
  })
  @Put('users/:id/bank-info')
  async addBankInfo(
    @Param('id') id: string,
    @Body() addBankInfoDto: AddBankInfoDto,
  ) {
    const newUser = await this.usersService.findByIdAndUpdate(id, {
      $push: {
        bankInfos: addBankInfoDto,
      },
    });

    if (!newUser) {
      throw new NotFoundException('user not exist');
    }
    return newUser;
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.USER,
  })
  @Put('users/:id/bank-info/:bankId')
  async editBankInfo(
    @Param('id') id: string,
    @Param('bankId') bankId: string,
    @Body() editBankInfoDto: EditBankInfoDto,
  ) {
    const newUser = await this.usersService.findOneAndUpdate(
      {
        _id: id,
        'bankInfos._id': bankId,
      },
      {
        $set: {
          'bankInfos.$.bankName': editBankInfoDto.bankName,
          'bankInfos.$.bankAccountNumber': editBankInfoDto.bankAccountNumber,
          'bankInfos.$.bankCardNumber': editBankInfoDto.bankCardNumber,
          'bankInfos.$.bankAccountOwner': editBankInfoDto.bankAccountOwner,
          'bankInfos.$.bankBranch': editBankInfoDto.bankBranch,
          'bankInfos.$.bankSheba': editBankInfoDto.bankSheba,
        },
      },
    );

    if (!newUser) {
      throw new NotFoundException('bank info not exist');
    }

    return newUser;
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.USER,
  })
  @Delete('users/:id/bank-info/:bankId')
  async deleteBankInfo(
    @Param('id') id: string,
    @Param('bankId') bankId: string,
  ) {
    const newUser = await this.usersService.findOneAndUpdate(
      {
        _id: id,
        'bankInfos._id': bankId,
      },
      {
        $pull: {
          bankInfos: { _id: bankId },
        },
      },
    );

    if (!newUser) {
      throw new NotFoundException('bank info not exist');
    }
    return newUser;
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.USER,
  })
  @Put('users/:id/credit')
  async updateUserCredit(
    @Param('id') id: string,
    @Body() updateUserCreditDto: UpdateUserCreditDto,
  ) {
    const updateData = updateUserCreditDto.isFixed
      ? { credit: updateUserCreditDto.amount }
      : {
          $inc: { credit: updateUserCreditDto.amount },
        };
    const newUser = await this.usersService.findByIdAndUpdate(id, updateData);
    if (!newUser) {
      throw new NotFoundException('user not exist.');
    }
    return newUser;
  }

  @CheckPermissions({
    action: PermissionAction.READ_OWN,
    subject: Subjects.USER,
  })
  @Get('users/debts/list')
  async getDebtsList(
    @ActiveUser() user: ActiveUserData,
    @Query() queryDto: GetQueryDto,
  ) {
    const filter = JSON.parse(queryDto.filters || '{}');
    filter.userId = user.id;
    queryDto.filters = JSON.stringify(filter);
    const data = await this.debtService.findAll(queryDto);
    return data;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.USER,
  })
  @Get('users/:userId/debts/list')
  async getUserDebtList(
    @Param('userId') userId: string,
    @Query() queryDto: GetQueryDto,
  ) {
    const filter = JSON.parse(queryDto.filters || '{}');
    filter.userId = userId;

    queryDto.filters = JSON.stringify(filter);
    const data = await this.debtService.findAll(queryDto);
    const user = await this.usersService.findById(userId);
    const debts = await this.debtService.findWithOutPagination(
      JSON.parse(queryDto.filters),
    );

    const debtSum = debts.reduce((sum, debt) => {
      if (debt.isPaid === false) {
        return sum + debt.amount;
      } else {
        return sum;
      }
    }, 0);

    return { ...data, remainedCredit: user.credit - debtSum };
  }

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.USER,
  })
  @Post('users/user-assignment')
  async assignUserToBuyer(
    @Body() userBuyerDto: CreateUserBuyerDto,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return await this.usersService.assignUserToBuyer({
      ...userBuyerDto,
      createdBy: activeUser.id,
    });
  }
  //buyers/:id/members
  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.USER,
  })
  @Get('users/:id/buyers')
  async getUsersOfBuyer(@Param('id') id: string) {
    const queryDto: GetQuery = new GetQuery();

    queryDto.filters = `{"_id": "${id}"}`;
    queryDto.page = 0;
    queryDto.size = 1000;

    const data = await this.usersService.getBuyersOfUser(queryDto);
    return data;
  }

  @CheckPermissions({
    action: PermissionAction.DELETE,
    subject: Subjects.USER,
  })
  @Delete('users/delete-user-assignment/:id')
  async deleteUserBuyerAssignment(@Param('id') id: string) {
    return await this.usersService.deleteUserBuyerAssignment(id);
  }

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.USER,
  })
  @Post('create-debt')
  async createDebt(@Body() createDebtDto: CreateDebtDto) {
    const { instanceId, users } = createDebtDto;
    const userIds = [];
    const userTypes = [];
    let deleted = false;

    const instance = await this.instanceService.findOne(instanceId, [
      'InspectionFeeInRial',
    ]);

    if (!instance) {
      throw new Error('Instance not found');
    }

    for (const user of users) {
      userIds.push(user.id);
      userTypes.push(user.type);
    }

    userIds.sort();
    userTypes.sort();
    let identicalUserIds = true,
      identicalUserTypes = true;
    const debts = await this.debtService.findWithOutPagination({
      instanceId,
      caseNo: instance.caseNo,
    });
    if (debts.length > 0) {
      const insertedUserIds = debts.map((debt) => debt.userId.toString());
      const insertedUserTypes = debts.map((debt) => debt.userType.toString());
      if (userIds.length !== insertedUserIds.length) {
        for (const userId of insertedUserIds) {
          if (!userIds.includes(userId)) {
            deleted = true;
            await this.debtService.deleteOne({ instanceId, userId });
          }
        }
      }

      insertedUserIds.sort();
      insertedUserTypes.sort();
      for (let i = 0; i < userIds.length; i++) {
        if (userIds[i] !== insertedUserIds[i]) {
          identicalUserIds = false;
        }
        if (userTypes[i] !== insertedUserTypes[i]) {
          identicalUserTypes = false;
        }
      }
      if (
        identicalUserIds &&
        identicalUserTypes &&
        instance.parameters.InspectionFeeInRial == debts[0].amount
      ) {
        // if (!deleted) {
        throw new BadRequestException('Duplicate record');
        // }
      } else {
        const debtsToUpdate = [];
        for (let i = 0; i < debts.length; i++) {
          debtsToUpdate.push(
            this.debtService.updateById(debts[i]._id, {
              $set: {
                userId: userIds[i],
                userType: userTypes[i],
                amount: createDebtDto.amount,
              },
            }),
          );
        }
        return await Promise.all(debtsToUpdate);
      }
    }

    const debtToCreate = [];
    for (let i = 0; i < userIds.length; i++) {
      debtToCreate.push(
        this.debtService.create({
          userId: userIds[i],
          userType: userTypes[i],
          amount: parseFloat(instance.parameters.InspectionFeeInRial),
          caseNo: instance.caseNo,
          instanceId,
        }),
      );
    }
    return Promise.all(debtToCreate);
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.USER,
  })
  @Patch('pay-instance-debt')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        instanceIds: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
      },
      required: ['instanceIds'],
    },
  })
  async payThisInstance(@Body() body: { instanceIds: string[] }) {
    return await this.debtService.updateMany(
      { instanceId: { $in: body.instanceIds } },
      { $set: { isPaid: true } },
    );
  }

  @Patch('/amount/:instanceId/:amount')
  async updateDebtAmount(
    @Param('instanceId') instanceId: string,
    @Param('amount') amount: number,
  ) {
    return await this.debtService.updateAmount(instanceId, amount);
  }

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.USER,
  })
  @Post('buyers')
  async createBuyer(
    @Body() createBuyerDto: CreateBuyerDto,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    const buyer = await this.buyerService.create({
      ...createBuyerDto,
      createdBy: activeUser.id,
    });
    return buyer;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.USER,
  })
  @Get('buyers')
  async findAllBuyers(@Query() queryDto: GetQueryDto) {
    const populateArray = [];

    if (queryDto.populate) {
      const populateFields = queryDto.populate.split(' ');

      for (const field of populateFields) {
        populateArray.push({
          path: field.trim(),
        });
      }
    }

    populateArray.push({
      path: 'branches',
      select: 'type name title',
    });

    queryDto.populate = populateArray;

    const buyers = await this.buyerService.findAll(queryDto);
    return buyers;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.USER,
  })
  @Get('buyers/:id')
  async findOneBuyer(@Param('id') id: string) {
    const buyer = await this.buyerService.findById(id, [
      // 'user',
      {
        path: 'branches',
        select: 'type name title',
      },
      { path: 'industryId' },
      { path: 'subIndustryId' },
    ]);
    if (!buyer) {
      throw new NotFoundException('buyer not exist.');
    }
    return buyer;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.USER,
  })
  @Get('buyers/:id/members')
  async getBuyersMember(
    @Param('id') id: string,
    @ActiveUser() user: ActiveUserData,
  ) {
    const queryDto: GetQuery = new GetQuery();

    queryDto.filters = `{"_id": "${id}"}`;
    queryDto.page = 0;
    queryDto.size = 1000;

    const data = await this.buyerService.getMembersOfBuyer(queryDto, user);
    return data;
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.USER,
  })
  @Put('buyers/:id')
  async updateBuyer(
    @Param('id') id: string,
    @Body() updateBuyerDto: UpdateBuyerDto,
  ) {
    const newBuyer = await this.buyerService.findByIdAndUpdate(
      id,
      updateBuyerDto,
    );
    if (!newBuyer) {
      throw new NotFoundException('buyer not exist.');
    }
    return newBuyer;
  }

  @CheckPermissions({
    action: PermissionAction.DELETE,
    subject: Subjects.USER,
  })
  // TODO Need to change
  @Delete('buyers/:id')
  async deleteBuyer(@Param('id') id: string) {
    const checkDeleted = await this.buyerService.softDeleteById(id);
    if (!checkDeleted) {
      throw new NotFoundException('buyer not exist.');
    }
    //TODO delete relation should added
  }
}
