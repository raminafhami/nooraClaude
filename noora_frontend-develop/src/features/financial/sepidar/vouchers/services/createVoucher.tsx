import apiClient from "@/api/client";

import { VoucherItem } from "../models/VoucherItem";

interface CreateVoucherModel {
  date: string;
  description: string;
  items: VoucherItem[];
}

export interface CreateVoucherApiModel {
  date: string;
  headerDescription: string;
  items: {
    Credit: number;
    Debit: number;
    Description: string;
    DLCode: string;
    SLCode: string;
  }[];
}

export default async function createVoucher(
  details: CreateVoucherModel,
): Promise<string> {
  const data: CreateVoucherApiModel = {
    date: details.date,
    headerDescription: details.description,
    items: details.items.map((x) => ({
      Credit: x.credit,
      Debit: x.debit,
      Description: x.description,
      DLCode: x.dlCode,
      SLCode: x.slCode,
    })),
  };

  const response = await apiClient.post<string>({
    url: "/financial/voucher",
    body: data,
  });

  return response.result;
}
