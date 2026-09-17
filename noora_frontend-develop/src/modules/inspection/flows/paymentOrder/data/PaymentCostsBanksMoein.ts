import { SelectItem } from "@/entities";

export enum PaymentCostsBanksMoeinProps {
  bank = "111005",
  otherPay = "211112",
  otherGive = "111312",
  box = "111002",
}

export const PaymentCostsBanksMoein: SelectItem<PaymentCostsBanksMoeinProps>[] =
  [
    {
      label: "بانک ها",
      value: PaymentCostsBanksMoeinProps.bank,
    },
    {
      label: "سایر پرداختی ها",
      value: PaymentCostsBanksMoeinProps.otherPay,
    },
    {
      label: "سایر دریافتی ها",
      value: PaymentCostsBanksMoeinProps.otherGive,
    },
    {
      label: "صندوق ارزی",
      value: PaymentCostsBanksMoeinProps.box,
    },
  ];
