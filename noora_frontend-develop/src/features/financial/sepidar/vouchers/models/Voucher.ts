import { VoucherItem } from "./VoucherItem";

export interface Voucher {
  date: string;
  description: string;
  items: VoucherItem[];
}
