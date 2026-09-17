import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeederService } from './seeder.service';
import { AdminSeederService } from './admin-seeder.service';
import { IamModule } from '../iam/iam.module';
import { User, UserSchema } from '../users/schemas/user.schema';
import {
  UserGroup,
  UserGroupSchema,
} from '../user-groups/schemas/user-group.schema';
import {
  Permission,
  PermissionSchema,
} from '../permissions/schemas/permission.schema';
import { IndustryModule } from '../industry/industry.module';
import { ProjectModule } from '../project/project.module';
import { CategoryModule } from '../categories/category.module';
import { InspectionCostsModule } from '../inspection-costs/inspection-costs.module';

@Module({
  imports: [
    IndustryModule,
    ProjectModule,
    CategoryModule,
    InspectionCostsModule,
    IamModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserGroup.name, schema: UserGroupSchema },
      { name: Permission.name, schema: PermissionSchema },
    ]),
  ],
  providers: [SeederService, AdminSeederService],
  exports: [SeederService, AdminSeederService],
})
export class SeederModule {}
