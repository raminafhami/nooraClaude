import { Injectable, OnModuleInit } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import * as moment from 'moment-jalaali';
import { invoiceMapping } from '../mapping/invoice.mapping';
import { InvoiceSearchBody } from '../interfaces/invoice-search.interface';
moment.loadPersian({ usePersianDigits: false });

@Injectable()
export class InvoiceSearchService implements OnModuleInit {
  private readonly index = 'invoices';

  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async onModuleInit() {
    try {
      const indexExists = await this.elasticsearchService.indices.exists({
        index: this.index,
      });

      if (!indexExists) {
        await this.elasticsearchService.indices.create({
          index: this.index,
          body: {
            mappings: invoiceMapping,
          },
        });
      } else {
        await this.elasticsearchService.indices.putMapping({
          index: this.index,
          ...invoiceMapping,
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  async indexInvoice(invoice: any) {
    const date = {
      yearOfExpiryAt: moment(invoice.expiryAt).locale('fa').jYear(),
      monthOfExpiryAt: moment(invoice.expiryAt).locale('fa').jMonth(),
      dayOfExpiryAt: moment(invoice.expiryAt).locale('fa').jDayOfYear(),
      yearOfIssuedAt: moment(invoice.issuedAt).locale('fa').jYear(),
      monthOfIssuedAt: moment(invoice.issuedAt).locale('fa').jMonth(),
      dayOfIssuedAt: moment(invoice.issuedAt).locale('fa').jDayOfYear(),
      yearOfCreatedAt: moment(invoice.createdAt).locale('fa').jYear(),
      monthOfCreatedAt: moment(invoice.createdAt).locale('fa').jMonth(),
      dayOfCreatedAt: moment(invoice.createdAt).locale('fa').jDayOfYear(),
    };

    return this.elasticsearchService.index<InvoiceSearchBody>({
      index: this.index,
      id: invoice._id.toString(),
      body: {
        id: invoice._id.toString(),
        title: invoice.title,
        description: invoice.description,
        status: invoice.status,
        type: invoice.type,
        expiryAt: invoice.expiryAt,
        issuedAt: invoice.issuedAt,
        items: invoice.items,
        recipient: invoice.recipient,
        invoiceNo: invoice.invoiceNo,
        issueNo: invoice.issueNo,
        discount: invoice.discount,
        duty: invoice.duty,
        additionalFee: invoice.additionalFee,
        isCash: invoice.isCash,
        financialDocumentId: invoice.financialDocumentId,
        total: invoice.total,
        tax: invoice.tax,
        createdBy: invoice.createdBy,
        issuedBy: invoice.issuedBy,
        updatedBy: invoice.updatedBy,
        createdAt: invoice.createdAt,
        updatedAt: invoice.updatedAt,
        ...date,
        
      },
    });
  }
}
