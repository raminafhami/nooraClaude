import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { CrudService } from 'src/shared/crud/service/crud.service';
import { DebtRepositoryImpl } from '../repository/debt.repository';
import { DebtDocument } from '../schemas/debt.schema';
import { UsersService } from './users.service';
import { Types } from 'mongoose';
import { ProcessInstanceService } from 'src/modules/process-instances/process-instances.service';
import { Constants } from 'src/common/const/constants';

@Injectable()
export class DebtService extends CrudService<DebtDocument> {
  constructor(
    private debtRepositoryImpl: DebtRepositoryImpl,
    private usersService: UsersService,
    @Inject(forwardRef(() => ProcessInstanceService))
    private processInstanceService: ProcessInstanceService,
  ) {
    super(debtRepositoryImpl);
  }

  async canPaidThisAmount(userId: string, amount: number) {
    const user = await this.usersService.findById(userId);
    const [data] = await this.debtRepositoryImpl.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId),
          isPaid: false,
        },
      },
      {
        $group: {
          _id: '$userId',
          totalDebt: {
            $sum: '$amount',
          },
        },
      },
    ]);

    if (user.credit - (data?.totalDebt || 0) < amount) {
      return false;
    } else {
      return true;
    }
  }

  async addDebt(userId: string, amount: number, instanceId: string) {
    return this.debtRepositoryImpl.create({ userId, amount, instanceId });
  }

  async paidThisInstance(userId: string, instanceId: string) {
    const debt = await this.updateMany(
      { instanceId },
      { $set: { isPaid: true } },
    );
    // await this.usersService.updateById(userId, {
    //   $inc: { credit: -debt.amount },
    // });
  }

  async debtUpdated(
    userId: string,
    instanceId: string,
    amount: number,
    checkCredit: boolean,
  ) {
    const instance = await this.processInstanceService.findOnePublic(
      instanceId,
      [],
    );
    if (instance.status === Constants.STAGE_STATUSES.ON_HOLD) {
      throw new BadRequestException('you cant update this instance.');
    }
    const user = await this.usersService.findById(userId);
    const oldDebt = await this.debtRepositoryImpl.findOne({
      userId,
      instanceId,
    });
    if (oldDebt.amount >= amount || !checkCredit) {
      return this.debtRepositoryImpl.findOneAndUpdate(
        { userId, instanceId },
        { amount },
      );
    } else {
      const [data] = await this.debtRepositoryImpl.aggregate([
        {
          $match: {
            userId: new Types.ObjectId(userId),
            isPaid: false,
          },
        },
        {
          $group: {
            _id: '$userId',
            totalDebt: {
              $sum: '$amount',
            },
          },
        },
      ]);
      const newDebts = (data?.totalDebt || 0) - oldDebt.amount;
      if (user.credit - newDebts < amount) {
        return false;
      } else {
        return this.debtRepositoryImpl.findOneAndUpdate(
          { userId, instanceId },
          { amount },
        );
      }
    }
  }

  async updateAmount(instanceId: string, amount: number) {
    const instance = await this.processInstanceService.findOnePublic(
      instanceId,
      [],
    );
    if (instance.status === Constants.STAGE_STATUSES.ON_HOLD) {
      throw new BadRequestException('you cant update this instance.');
    }
    return await this.debtRepositoryImpl.updateMany(
      { instanceId },
      { $set: { amount } },
    );
  }

  async getAllDebts() {
    return this.debtRepositoryImpl.find({}, null, null, null, null, [
      { path: 'userId', select: 'name lastname phoneNo' },
      { path: 'instanceId', select: 'createdAt' },
    ]);
  }
}
