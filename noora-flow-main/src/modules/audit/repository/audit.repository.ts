import { Injectable, Scope } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';
import { Audit, AuditDocument } from '../schemas/audit.schema';

@Injectable()
export class AuditRepositoryImpl extends BaseRepositoryImpl<AuditDocument> {
  constructor(
    @InjectModel(Audit.name)
    protected auditModel: Model<AuditDocument>,
  ) {
    super(auditModel);
  }
}
