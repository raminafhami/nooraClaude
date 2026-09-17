import apiClient from "@/api/client";

interface CreateInvoiceModel {
  number: string | null;
  caseNos: string;
  date: string;
  description: string;
  saleTypeNumber: string;
  sepidarId: string;
  items: {
    code: string;
    description: string;
    duty: string;
    fee: string;
    quantity: string;
    tax: string;
  }[];
}

interface CreateInvoiceApiModel {
  number: string | null;
  customerCode: string;
  date: string;
  deliveryLocation: string;
  description: string;
  saleTypeNumber: string;
  invoiceItems: {
    itemCode: string;
    itemDescription: string;
    quantity: string;
    fee: string;
    tax: string;
    duty: string;
  }[];
}

export default async function createInvoice(
  details: CreateInvoiceModel,
): Promise<string> {
  const data: CreateInvoiceApiModel = {
    number: details.number,
    customerCode: details.sepidarId,
    date: details.date,
    deliveryLocation: details.caseNos,
    description: details.description,
    saleTypeNumber: details.saleTypeNumber,
    invoiceItems: details.items.map((x) => ({
      itemCode: x.code,
      itemDescription: x.description,
      quantity: x.quantity,
      fee: x.fee,
      tax: x.tax,
      duty: x.duty,
    })),
  };

  const response = await apiClient.post<string>({
    url: "/financial/invoice",
    body: data,
  });

  return response.result;
}
