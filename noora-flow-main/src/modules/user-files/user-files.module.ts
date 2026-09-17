import { forwardRef, Module } from '@nestjs/common';
import { UserFilesService } from './user-files.service';
import { UserFilesController } from './user-files.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserFile, UserFileSchema } from './schemas/user-file.schema';
import { UserFileRepositoryImpl } from './repository/user-files.repository';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserFile.name, schema: UserFileSchema },
    ]),
    forwardRef(() => UsersModule),
  ],
  controllers: [UserFilesController],
  providers: [UserFilesService, UserFileRepositoryImpl],
  exports: [UserFilesService],
})
export class UserFilesModule {}
