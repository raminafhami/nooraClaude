import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Property, PropertySchema } from './schema/property.schema';
import { PropertyRepositoryImpl } from './repository/property.repository';
import { PropertyService } from './property.service';
import { PropertyController } from './property.controller';
import { UsersModule } from '../users/users.module';
import {
  PropertyFile,
  PropertyFileSchema,
} from './schema/property-file.schema';
import { PropertyFileRepositoryImpl } from './repository/property-file.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Property.name, schema: PropertySchema },
      { name: PropertyFile.name, schema: PropertyFileSchema },
    ]),
    UsersModule,
  ],
  controllers: [PropertyController],
  providers: [
    PropertyService,
    PropertyRepositoryImpl,
    PropertyFileRepositoryImpl,
  ],
})
export class PropertyModule {}
