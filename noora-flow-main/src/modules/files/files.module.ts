import { forwardRef, Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { MongooseModule } from '@nestjs/mongoose';
import { File, FileSchema } from './schemas/files.schema';
import { ProcessInstancesModule } from '../process-instances/process-instances.module';
import {
  InspectionFile,
  InspectionFileSchema,
} from './schemas/inspection-files.schema';

@Module({
  imports: [
    forwardRef(() => ProcessInstancesModule),
    MongooseModule.forFeature([
      { name: File.name, schema: FileSchema },
      { name: InspectionFile.name, schema: InspectionFileSchema },
    ]),
  ],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
