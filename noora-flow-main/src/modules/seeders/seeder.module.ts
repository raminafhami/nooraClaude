import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeederService } from './seeder.service';
import { AdminSeederService } from './admin-seeder.service';
import { SystemDataSeederService } from './system-data-seeder.service';
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
import { Category, CategorySchema } from '../categories/entity/category.schema';
import {
  Indicator,
  IndicatorSchema,
} from '../indicator/schemas/indicator.schema';

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
      { name: Category.name, schema: CategorySchema },
      { name: Indicator.name, schema: IndicatorSchema },
    ]),
  ],
  providers: [SeederService, AdminSeederService, SystemDataSeederService],
  exports: [SeederService, AdminSeederService, SystemDataSeederService],
})
export class SeederModule {}
