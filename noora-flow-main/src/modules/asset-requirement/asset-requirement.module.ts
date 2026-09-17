import { Module } from '@nestjs/common';
import { AssetRequirementService } from './asset-requirement.service';
import { AssetRequirementController } from './asset-requirement.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AssetRequirement,
  AssetRequirementSchema,
} from './schemas/asset-requirement.schema';
import { AssetRequirementRepositoryImpl } from './repository/asset-requirement.repository';
import {
  AssetRequirementFile,
  AssetRequirementFileSchema,
} from './schemas/asset-requirement-file.schema';
import { AssetRequirementFileRepositoryImpl } from './repository/asset-requirement-file.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AssetRequirement.name, schema: AssetRequirementSchema },
      { name: AssetRequirementFile.name, schema: AssetRequirementFileSchema },
    ]),
  ],
  controllers: [AssetRequirementController],
  providers: [
    AssetRequirementService,
    AssetRequirementRepositoryImpl,
    AssetRequirementFileRepositoryImpl,
  ],
  exports: [AssetRequirementService],
})
export class AssetRequirementModule {}
