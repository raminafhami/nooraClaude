import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';
import { Invoice, InvoiceDocument } from '../schemas/invoice.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class InvoiceRepository extends BaseRepositoryImpl<InvoiceDocument> {
  constructor(
    @InjectModel(Invoice.name) protected invoiceModel: Model<InvoiceDocument>,
  ) {
    super(invoiceModel);
  }
}
