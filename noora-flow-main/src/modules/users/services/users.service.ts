import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
  HttpStatus,
} from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { HashingService } from '../../iam/hashing-and-encryption/hashing.service';
import { IamModule } from '../../iam/iam.module';
import { Model } from 'mongoose';
import { ConfigType } from '@nestjs/config';
import {
  LoginTypes,
  User,
  UserDocument,
  UserTypes,
} from '../schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { RegisterDto } from '../../iam/authentication/dto/register.dto';
import CustomError from 'src/common/providers/custom-error';
import { UserRepositoryImpl } from '../repository/users.repository';
import { CrudService } from 'src/shared/crud/service/crud.service';
import { UserBuyer } from '../schemas/user-buyer.schema';
import { CreateUserBuyerDto } from '../dto/create-user-buyer.dto';
import { UserBuyerRepositoryImpl } from '../repository/user-buyer.repository';
import { ActiveUserData } from 'src/modules/iam/authentication/interfaces/active-user-data.interface';
import { GetQueryDto } from 'src/modules/process-instances/dtos';
import { QueueService } from 'src/modules/queue/queue.service';
import { ConfigureEmailDto } from 'src/modules/emails/dto/configure-email.dto';
import { EncryptionService } from 'src/modules/iam/hashing-and-encryption/encryption.service';

@Injectable()
export class UsersService extends CrudService<UserDocument> {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(UserBuyer.name) private userBuyerModel: Model<UserBuyer>,
    private userRepositoryImpl: UserRepositoryImpl,
    private userBuyerRepositoryImpl: UserBuyerRepositoryImpl,
    private readonly hashingService: HashingService,
    private readonly queueService: QueueService,
    private readonly encryptionService: EncryptionService,
  ) {
    super(userRepositoryImpl);
  }
  async isExist(query: any) {
    return this.userModel.exists(query);
  }
  async create(userDto: CreateUserDto) {
    return this.userModel.create(userDto);
  }
  async register(registerDto: RegisterDto) {
    try {
      const user = await this.userModel.create(registerDto);
      return { user };
    } catch (error) {
      throw new CustomError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Error in registering user',
      );
    }
  }
  async createUserByAdmin(userDto: CreateUserDto) {
    const isExistUser = await this.isExist({
      $or: [
        { $and: [{ email: userDto.email }, { email: { $ne: null } }] },
        { $and: [{ username: userDto.username }, { username: { $ne: null } }] },
        { $and: [{ phoneNo: userDto.phoneNo }, { phoneNo: { $ne: null } }] },
        {
          $and: [
            { nationalCode: userDto.nationalCode },
            { nationalCode: { $ne: null } },
          ],
        },
      ],
    });
    if (isExistUser) {
      throw new BadRequestException('this user is exist.');
    }
    const meta = null;
    if (userDto.type === UserTypes.NORMAL) {
      userDto.loginType = LoginTypes.OTP;
      // meta = {
      //   representativeName: userDto.representativeName,
      //   registrationNo: userDto.registrationNo,
      // };
    }
    const user = await this.create({
      ...userDto,
      ...meta,
      password: await this.hashingService.hash(userDto.password),
    });

    if (userDto.type === UserTypes.NORMAL) {
      await this.queueService.welcomeMessage({
        lastname: userDto.lastname,
        phoneNo: userDto.phoneNo,
      });
    }

    return { user };
  }
  async hashPassword(password: string) {
    return this.hashingService.hash(password);
  }
  async filterUsers(query: any) {
    const params = { filters: JSON.stringify(query) } as any;
    params.projection = { _id: 1 };
    const users = await this.find(params);
    return users.map((u) => u.id);
  }
  async findAllPermissions(userId: string): Promise<any[]> {
    const userWithRoleAndPermissions: any = await this.userModel
      .findById(userId)
      .populate({ path: 'groups', populate: { path: 'permissions' } })
      .select('groups');

    return (
      userWithRoleAndPermissions?.groups.reduce((acc, cur) => {
        if (cur?.permissions) {
          return cur.permissions.concat(acc);
        } else {
          return acc;
        }
      }, []) || []
    );
  }

  async createUserBuyer(userBuyerDto: CreateUserBuyerDto) {
    const existingAssignment = await this.userBuyerModel.findOne({
      userId: userBuyerDto.userId,
      buyerId: userBuyerDto.buyerId,
      branchId: userBuyerDto.branchId,
      isActive: true,
    });

    if (existingAssignment) {
      throw new BadRequestException('relation is exist.');
    }
    return await this.userBuyerRepositoryImpl.create({
      ...userBuyerDto,
    });
  }

  async assignUserToBuyer(userBuyerDto: CreateUserBuyerDto) {
    return await this.createUserBuyer(userBuyerDto);
  }

  async deleteUserBuyerAssignment(id: string) {
    const relation = await this.userBuyerRepositoryImpl.findOne({ _id: id });

    if (!relation) {
      throw new BadRequestException('relation is not exist.');
    }

    return await this.userBuyerRepositoryImpl.findByIdAndUpdate(id, {
      isActive: false,
    });
  }

  async getBuyersOfUser(queryDto: GetQueryDto) {
    const populates = [];
    populates.push(
      {
        $lookup: {
          from: 'userbuyers',
          let: { id: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$userId', '$$id'],
                },
              },
            },
          ],
          as: 'userBuyer',
        },
      },
      {
        $unwind: {
          path: '$userBuyer',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'buyers',
          let: { buyerId: '$userBuyer.buyerId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$buyerId'],
                },
              },
            },
          ],
          as: 'buyer',
        },
      },
      {
        $unwind: {
          path: '$buyer',
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $lookup: {
          from: 'usergroups',
          let: { branchId: '$userBuyer.branchId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$branchId'],
                },
              },
            },
            {
              $project: {
                title: 1,
                name: 1,
              },
            },
          ],
          as: 'branch',
        },
      },
      {
        $unwind: {
          path: '$branch',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          buyer: 1,
          userId: '$userBuyer.userId',
          buyerId: '$userBuyer.buyerId',
          role: '$userBuyer.role',
          isConnector: '$userBuyer.isConnector',
          isActive: '$userBuyer.isActive',
          branch: 1,
        },
      },
    );

    queryDto.populate = populates;
    const [result] = await this.aggregateByDynamicFilter(queryDto);
    result.data = result.data.map((d) => {
      delete d._id;
      return d;
    });
    return result.data;
  }

  async configureEmail(
    userId: string,
    config: ConfigureEmailDto,
  ): Promise<User> {
    const encryptedImapPassword = this.encryptionService.encrypt(
      config.password,
    );
    return this.userRepositoryImpl.findByIdAndUpdate(userId, {
      emailConfig: {
        user: config.user,
        encryptedPassword: encryptedImapPassword,
      },
    });
  }

  async checkEmailConfig(userId: string) {
    const user = await this.userRepositoryImpl.findById(userId);
    return user.emailConfig;
  }

  async getEmailConfig(userId: string) {
    const user = await this.userRepositoryImpl.findById(userId);
    if (!user.emailConfig) {
      throw new BadRequestException('you need to configure email.');
    }
    const decryptedPassword = this.encryptionService.decrypt(
      user.emailConfig.encryptedPassword,
    );

    return {
      user: user.emailConfig.user,
      pass: decryptedPassword,
      fullname: `${user.name} ${user.lastname}`,
    };
  }
}
