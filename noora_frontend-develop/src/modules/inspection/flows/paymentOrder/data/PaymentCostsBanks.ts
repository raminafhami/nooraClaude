import { SelectItem } from "@/entities";

export enum PaymentCostsBanksProps {
  sepah = "001",
  golnar = "002",
  momtaz = "003",
  cardkhan = "004",
  tejaratJari = "007",
  tejaratShort = "008",
  pasargadHooman = "009",
  pasargadKiarash = "016",
  other = "other",
}

export const PaymentCostsBanks: SelectItem<PaymentCostsBanksProps>[] = [
  {
    label: "رسمی سپه جاری - 171800185402 - یوسف آباد",
    value: PaymentCostsBanksProps.sepah,
  },
  {
    label: "ملی - 0201594072005 - فریما فرخ مهر",
    value: PaymentCostsBanksProps.golnar,
  },
  {
    label: "ملی - 0226892601006 - هومن علایی",
    value: PaymentCostsBanksProps.momtaz,
  },
  {
    label: "کارتخوان",
    value: PaymentCostsBanksProps.cardkhan,
  },
  {
    label: "تجارت جاری - 2904059288",
    value: PaymentCostsBanksProps.tejaratJari,
  },
  {
    label: "تجارت کوتاه مدت - 2904357033",
    value: PaymentCostsBanksProps.tejaratShort,
  },
  {
    label: "پاسارگاد هومن علایی - 216/8000/14020257/1",
    value: PaymentCostsBanksProps.pasargadHooman,
  },
  {
    label: "پاسارگاد کیارش شبدیز - 320800514951",
    value: PaymentCostsBanksProps.pasargadKiarash,
  },
  {
    label: "انتخاب دستی",
    value: PaymentCostsBanksProps.other,
  },
];
