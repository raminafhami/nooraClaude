import { Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Audit, AuditSchema } from './schemas/audit.schema';
import { AuditRepositoryImpl } from './repository/audit.repository';
import { AssetRequirementModule } from '../asset-requirement/asset-requirement.module';
import { UsersModule } from '../users/users.module';
import { UserGroupsModule } from '../user-groups/user-groups.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Audit.name, schema: AuditSchema }]),
    AssetRequirementModule,
    UsersModule,
    UserGroupsModule,
  ],
  controllers: [AuditController],
  providers: [AuditService, AuditRepositoryImpl],
})
export class AuditModule {}
