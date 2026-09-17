import { Module } from '@nestjs/common';
import { UserRelationsService } from './user-relations.service';
import { UserRelationsController } from './user-relations.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserRelationsRepositoryImpl } from './repository/user-relation.repository';
import {
  UserRelations,
  UserRelationsSchema,
} from './schemas/user-relation.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserRelations.name, schema: UserRelationsSchema },
    ]),
  ],
  controllers: [UserRelationsController],
  providers: [UserRelationsService, UserRelationsRepositoryImpl],
})
export class UserRelationsModule {}
