import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { IamModule } from '../iam/iam.module';
import { Buyer, BuyerSchema } from './schemas/buyer.schema';
import { BuyerRepositoryImpl } from './repository/buyer.repository';
import { BuyerService } from './services/buyer.service';
import { UserRepositoryImpl } from './repository/users.repository';
import { DebtService } from './services/debt.service';
import { DebtRepositoryImpl } from './repository/debt.repository';
import { Debt, DebtSchema } from './schemas/debt.schema';
import { UserBuyer, UserBuyerSchema } from './schemas/user-buyer.schema';
import { UserBuyerRepositoryImpl } from './repository/user-buyer.repository';
import { ProcessInstancesModule } from '../process-instances/process-instances.module';
import { QueueModule } from '../queue/queue.module';
@Module({
  imports: [
    forwardRef(() => IamModule),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Buyer.name, schema: BuyerSchema },
      { name: Debt.name, schema: DebtSchema },
      { name: UserBuyer.name, schema: UserBuyerSchema },
    ]),
    forwardRef(() => ProcessInstancesModule),
    forwardRef(() => QueueModule),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    BuyerService,
    DebtService,
    UserRepositoryImpl,
    BuyerRepositoryImpl,
    DebtRepositoryImpl,
    UserBuyerRepositoryImpl,
  ],
  exports: [UsersService, BuyerService, DebtService],
})
export class UsersModule {}
