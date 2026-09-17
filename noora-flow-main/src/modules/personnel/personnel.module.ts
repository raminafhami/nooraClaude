import { forwardRef, Module } from '@nestjs/common';
import { PersonnelService } from './personnel.service';
import { PersonnelController } from './personnel.controller';
import { PersonnelRepositoryImpl } from './repository/personnel.repository.impl';
import { MongooseModule } from '@nestjs/mongoose';
import { Personnel, PersonnelSchema } from './schemas/personnel.schema';
import { PersonnelExpertiseModule } from '../personnel-expertise/personnel-expertise.module';
import { UsersModule } from '../users/users.module';
import { JobDescriptionModule } from '../job-description/job-description.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Personnel.name, schema: PersonnelSchema },
    ]),
    PersonnelExpertiseModule,
    forwardRef(() => UsersModule),
    JobDescriptionModule,
  ],
  providers: [PersonnelService, PersonnelRepositoryImpl],
  controllers: [PersonnelController],
  exports: [PersonnelService],
})
export class PersonnelModule {}
