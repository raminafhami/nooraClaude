import { BadRequestException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, map } from 'rxjs';
import { InsertInvoiceDto } from './dto/insert-invoice.dto';
import { InsertCustomerDto } from './dto/insert-customer.dto';
import { InvoiceDocument } from '../invoice/schemas/invoice.schema';
import { Item } from './dto/insert-voucher.dto';

@Injectable()
export class FinancialService {
  private readonly USERNAME = 'webuser';
  private readonly PASSWORD = 'Sepidar@123';

  constructor(private readonly http: HttpService) {}

  async submit(submitFinancialDto: any) {
    submitFinancialDto.cases = await Promise.all(
      submitFinancialDto.cases.map(async (c) => {
        let code = await this.http
          .post('Service1.svc/CheckDeliveryLocation', {
            Code: c.caseNo,
            Password: this.PASSWORD,
            Username: this.USERNAME,
          })
          .pipe(map((res) => res.data))
          .toPromise();

        if (code == 0) {
          code = await this.http
            .post('Service1.svc/InsertDeliveryLocation', {
              Title: c.caseNo,
              Username: this.USERNAME,
              Password: this.PASSWORD,
            })
            .pipe(map((res) => res.data))
            .toPromise();
        }
        c.code = code;
        return c;
      }),
    );

    submitFinancialDto.cases = await Promise.all(
      submitFinancialDto.cases.map(async (c) => {
        if (!c.invoiceNo) {
          let date;
          if (submitFinancialDto.invoiceType === 'official') {
            date = this.formatDate(new Date());
          } else {
            date = submitFinancialDto.paymentDate;
          }
          const data = await this.http
            .post('Service1.svc/InsertInvoice', {
              Number: null,
              BrokerCode: null,
              BrokerSharePercentage: null,
              BrokerCommission: null,
              QuotationID: null,
              BasedOnInventoryDelivery: '0',
              UserID: '1',
              CurrencyID: '1', // or 'ریال'
              CurrencyRate: '1',
              SaleTypeNumber: '1',
              Password: this.PASSWORD,
              Username: this.USERNAME,
              CustomerCode: submitFinancialDto.payerSepidarId,
              Date: date,
              DeliveryLocationID: parseInt(c.code),
              InvoiceItems: [
                {
                  Addition: '0',
                  Discount: '0',
                  Duty: c.toll,
                  Fee: c.fee,
                  ItemCode: '015',
                  // ItemCode: '100007',
                  Quantity: '1',
                  Tax: c.tax,
                  Tracing: null,
                  StockCode: null,
                  SecondaryQuantity: null,
                  // ItemDescription: 'String content',
                },
              ],
            })
            .pipe(map((res) => res.data))
            .toPromise();
          // response
          // {
          //   "ErrorMessage":"String content",
          //   "ID":"String content",
          //   "Number":"String content"
          // }

          if (data.Number == -1 || data.ErrorMessage) {
            throw new BadRequestException(data.ErrorMessage);
          }
          c.invoiceNo = data.Number;
        }
        return c;
      }),
    );
    const description = `دریافتی ${submitFinancialDto.cases.map(
      (item) => `فاکتور ${item.invoiceNo} فایل ${item.caseNo}`,
    )} رهگیری ${submitFinancialDto.receiptNo}`;

    const vouchers = [
      {
        Credit: 0,
        DLCode: submitFinancialDto.bankAccount,
        Debit: submitFinancialDto.paymentAmount,
        Description: description,
        SLCode: '111005',
      },
    ];

    submitFinancialDto.cases.forEach((c) => {
      vouchers.push({
        Credit: parseInt(c.total),
        DLCode: submitFinancialDto.payerSepidarId,
        Debit: 0,
        Description: `دریافتی فاکتور ${c.invoiceNo} از فایل ${c.caseNo}`,
        SLCode: '111201',
      });
    });

    const data = await this.http
      .post('Service1.svc/InsertVoucher', {
        Date: this.formatDate(new Date()),
        Password: this.PASSWORD,
        Username: this.USERNAME,
        HeaderDescription: description,
        VoucherItems: vouchers,
      })
      .pipe(map((res) => res.data))
      .toPromise();

    // response
    // {
    //   "ErrorMessage":"String content",
    //   "ID":"String content",
    //   "Number":"String content"
    // }
    if (data.Number == -1 || data.ErrorMessage) {
      throw new BadRequestException(data.ErrorMessage);
    }
    return {
      voucherId: data.ID,
      cases: submitFinancialDto.cases.map((c) => ({
        invoiceNo: c.invoiceNo,
        caseNo: c.caseNo,
      })),
    };
  }

  async getDlCodeByNationalCode(nationalCode: string) {
    const { data } = await firstValueFrom(
      this.http.post('Service1.svc/GetCustomerInfoByIdentificationCode', {
        Password: this.PASSWORD,
        Username: this.USERNAME,
        Code: nationalCode,
      }),
    );
    return !!data && data.Code;
  }

  async insertCustomerAndGetDlCode(insertCustomerDto: InsertCustomerDto) {
    try {
      const { data } = await firstValueFrom(
        this.http.post('Service1.svc/InsertCustomer', {
          Password: this.PASSWORD,
          Username: this.USERNAME,
          Address: insertCustomerDto.address,
          CustomerType: insertCustomerDto.type === 'natural' ? 1 : 2,
          EconomicCode: insertCustomerDto.nationalCode,
          IdentificationCode: insertCustomerDto.nationalCode,
          IsCustomer: insertCustomerDto.isCustomer,
          IsVendor: false,
          LastName: insertCustomerDto.lastname,
          LocationID: 2, // for IRAN
          Name: insertCustomerDto.name,
          Phone: insertCustomerDto.contactNo,
          Title: [insertCustomerDto.lastname, insertCustomerDto.name]
            .join(' ')
            .trim(),
          ZipCode: insertCustomerDto.postalCode,
          Code: insertCustomerDto.code,
        }),
      );

      if (data.Number == -1 || data.ErrorMessage) {
        throw new BadRequestException(data.ErrorMessage);
      }
      return data.Number;
    } catch (error) {
      console.log('Insert customer error sepidar', error);

      throw error;
    }
  }

  async insertVouchers(insertVoucherDto: any) {
    try {
      const data = await this.http
        .post('Service1.svc/InsertVoucher', {
          Date: insertVoucherDto.date,
          Password: this.PASSWORD,
          Username: this.USERNAME,
          HeaderDescription: insertVoucherDto.headerDescription,
          VoucherItems: insertVoucherDto.items,
        })
        .pipe(map((res) => res.data))
        .toPromise();
      if (data.Number == -1 || data.ErrorMessage) {
        throw new BadRequestException(data.ErrorMessage);
      }
      return data.ID;
    } catch (error) {
      console.log('sepidar', error);
      throw error;
    }
  }

  async insertInvoice(insertInvoiceDto: InsertInvoiceDto) {
    try {
      const deliveryLocationID = await this.http
        .post('Service1.svc/InsertDeliveryLocation', {
          Title: insertInvoiceDto.deliveryLocation,
          Username: this.USERNAME,
          Password: this.PASSWORD,
        })
        .pipe(map((res) => res.data))
        .toPromise();

      const invoiceItems = insertInvoiceDto.invoiceItems.map((i) => {
        return {
          Addition: '0',
          Discount: '0',
          Duty: i.duty,
          Fee: i.fee,
          ItemCode: i.itemCode,
          Quantity: i.quantity,
          Tax: i.tax,
          Tracing: null,
          StockCode: null,
          SecondaryQuantity: null,
          ItemDescription: i.itemDescription ? i.itemDescription : '',
        };
      });
      const data = await this.http
        .post('Service1.svc/InsertInvoice', {
          Number: insertInvoiceDto.number,
          BrokerCode: null,
          BrokerSharePercentage: null,
          BrokerCommission: null,
          QuotationID: null,
          BasedOnInventoryDelivery: '0',
          UserID: '1',
          CurrencyID: '1',
          CurrencyRate: '1',
          SaleTypeNumber: insertInvoiceDto.saleTypeNumber,
          Password: this.PASSWORD,
          Username: this.USERNAME,
          CustomerCode: insertInvoiceDto.customerCode,
          Date: insertInvoiceDto.date,
          DeliveryLocationID: parseInt(deliveryLocationID),
          InvoiceItems: invoiceItems,
          ExtraColumns: {
            Description: insertInvoiceDto.description
              ? insertInvoiceDto.description
              : '',
            ExtraColumn1: null,
            ExtraColumn2: null,
            ExtraColumn3: null,
            ExtraColumn4: null,
            ExtraColumn5: null,
          },
        })
        .pipe(map((res) => res.data))
        .toPromise();

      if (data.Number == -1 || data.ErrorMessage) {
        throw new BadRequestException(data.ErrorMessage);
      }
      return data.Number;
    } catch (error) {
      console.log('sepidar', error);
      throw error;
    }
  }

  private formatDate(date) {
    const d = new Date(date);

    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('/');
  }

  async generateVoucherItemsFromInvoices(
    invoices: InvoiceDocument[],
    dlCode: string,
    slCode: string,
    trackingCode: string,
  ) {
    const voucherItems: Item[] = [];
    // Grouping and summing
    const groupedData = invoices.reduce((acc, invoice) => {
      const refId = invoice.recipient.refId;

      if (!acc[refId]) {
        acc[refId] = {
          ...invoice.recipient,
          total: 0,
          tax: 0,
          description: this.getFinDocDescription([invoice]),
        };
      }

      invoice.items.forEach((item) => {
        acc[refId].total += item['total'];
        acc[refId].tax += item['tax'];
      });

      return acc;
    }, {});

    let invoicesTotal = 0,
      taxTotal = 0;
    for (let data in groupedData) {
      invoicesTotal += parseInt(groupedData[data]['total']);
      taxTotal += parseInt(groupedData[data]['tax']);
      let description = groupedData[data]['description'];
      if (description.length > 250) {
        description =
          description.slice(0, 240 - trackingCode.length) + '- غیره';
      }
      voucherItems.push({
        Credit: groupedData[data]['total'] + groupedData[data]['tax'],
        DLCode: groupedData[data]['financialId'],
        Debit: 0,
        Description: description,
        SLCode: '111201',
      });
    }
    let totalDescription = this.getFinDocDescription(invoices);

    if (totalDescription.length + trackingCode.length > 240) {
      totalDescription =
        totalDescription.slice(0, 230 - trackingCode.length) + '- غیره';
    }

    voucherItems.unshift({
      Credit: 0,
      Debit: invoicesTotal + taxTotal,
      Description: totalDescription + ` رهگیری ${trackingCode}`,
      DLCode: dlCode,
      SLCode: slCode, //'111005',
    });
    return voucherItems;
  }

  getFinDocDescription(invoices: InvoiceDocument[]) {
    const cases: string[] = [],
      issueNo: string[] = [];

    for (let invoice of invoices) {
      for (let item of invoice.items) {
        cases.push(item['caseNo']);
      }

      issueNo.push(invoice.issueNo);
    }

    const distinctCases = new Set(cases);
    const distinctIssueNos = new Set(issueNo);

    const description = `دریافتی فاکتور ${Array.from(distinctIssueNos).join(
      '،',
    )} فایل ${Array.from(distinctCases).join('،')}`;
    return description;
  }

  async checkCustomerCode(dlCode: string) {
    const data = await this.http
      .post('Service1.svc/CheckCustomerCode', {
        Password: this.PASSWORD,
        Username: this.USERNAME,
        Code: dlCode,
      })
      .pipe(map((res) => res.data))
      .toPromise();

    return data;
  }
}
