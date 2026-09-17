import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserGroup, UserGroupSchema } from './schemas/user-group.schema';
import { UserGroupsController } from './user-groups.controller';
import { UserGroupsService } from './user-groups.service';
import { UserGroupRepositoryImpl } from './repository/user-group.repository';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserGroup.name, schema: UserGroupSchema },
    ]),
  ],
  controllers: [UserGroupsController],
  providers: [UserGroupsService, UserGroupRepositoryImpl],
  exports: [UserGroupsService],
})
export class UserGroupsModule {}
