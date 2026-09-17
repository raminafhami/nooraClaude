import { Injectable, NotFoundException } from '@nestjs/common';
import { CrudService } from 'src/shared/crud/service/crud.service';
import { PropertyDocument } from './schema/property.schema';
import { PropertyRepositoryImpl } from './repository/property.repository';
import {
  DecommissionPropertyDto,
  MaintenanceRecordDto,
  RepairRecordDto,
} from './dto/maintenance-and-repair-record.dto';
import { PropertyStatus } from 'src/common/const/enums';
import * as fs from 'node:fs/promises';
import { PropertyFileRepositoryImpl } from './repository/property-file.repository';

@Injectable()
export class PropertyService extends CrudService<PropertyDocument> {
  constructor(
    private propertyRepositoryImpl: PropertyRepositoryImpl,
    private propertyFileRepositoryImpl: PropertyFileRepositoryImpl,
  ) {
    super(propertyRepositoryImpl);
  }
  async assignUser(propertyId: string, userId: string) {
    return this.propertyRepositoryImpl.findByIdAndUpdate(propertyId, {
      assignedUser: userId,
    });
  }

  async unassignUser(propertyId: string) {
    return this.propertyRepositoryImpl.findByIdAndUpdate(propertyId, {
      assignedUser: null,
    });
  }

  async addMaintenanceRecord(propertyId: string, record: MaintenanceRecordDto) {
    return this.propertyRepositoryImpl.findByIdAndUpdate(propertyId, {
      $push: {
        maintenanceHistory: {
          ...record,
          startDate: new Date(),
          endDate: null,
        },
      },
      $set: { status: PropertyStatus.UNDER_MAINTENANCE },
    });
  }

  async completeMaintenance(propertyId: string, maintenanceId: string) {
    const property = await this.propertyRepositoryImpl.findById(propertyId);
    const maintenance = property.maintenanceHistory.id(maintenanceId);
    maintenance.endDate = new Date();

    await property.save();
    return property;
  }

  async addRepairRecord(propertyId: string, record: RepairRecordDto) {
    return this.propertyRepositoryImpl.findByIdAndUpdate(propertyId, {
      $push: { repairHistory: record },
    });
  }

  async decommissionProperty(propertyId: string, dto: DecommissionPropertyDto) {
    return this.propertyRepositoryImpl.findByIdAndUpdate(propertyId, {
      $set: {
        decommissionDetails: dto,
        status: PropertyStatus.DECOMMISSIONED,
      },
    });
  }

  async getLifecycleReport(propertyId: string) {
    const property = await this.propertyRepositoryImpl.findById(propertyId);
    if (!property) return null;

    return {
      maintenanceCosts:
        property?.maintenanceHistory.reduce((sum, r) => sum + r.cost, 0) || 0,
      repairCosts:
        property.repairHistory?.reduce((sum, r) => sum + r.cost, 0) || 0,
      decommissionValue: property?.decommissionDetails?.scrapValue || 0,
    };
  }

  async deletePropertyWithFiles(id: string) {
    const file = await this.propertyFileRepositoryImpl.findOne({
      propertyId: id,
    });
    if (file) {
      await this.propertyFileRepositoryImpl.model.deleteMany({
        propertyId: id,
      });
      await fs.rm(file.directory, { recursive: true, force: true });
    }
    return this.propertyRepositoryImpl.deleteById(id);
  }

  async saveFile(data: any) {
    return this.propertyFileRepositoryImpl.create(data);
  }

  async getFile(fileId: string) {
    return this.propertyFileRepositoryImpl.findById(fileId);
  }

  async deletePropertyFile(fileId: string) {
    const file = await this.getFile(fileId);
    await this.propertyFileRepositoryImpl.deleteById(fileId);
    await fs.unlink(file.path);
  }

  async findPropertyFiles(filters: any) {
    return await this.propertyFileRepositoryImpl.findWithOutPagination(filters);
  }
}
