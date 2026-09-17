import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CompanyFile, CompanyFileSchema } from './schemas/company-file.schema';
import { CompanyFilesController } from './company-files.controller';
import { CompanyFileRepositoryImpl } from './repository/company-files.repository';
import { CompanyFilesService } from './company-files.service';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CompanyFile.name, schema: CompanyFileSchema },
    ]),
  ],
  controllers: [CompanyFilesController],
  providers: [CompanyFilesService, CompanyFileRepositoryImpl],
})
export class CompanyFilesModule {}
