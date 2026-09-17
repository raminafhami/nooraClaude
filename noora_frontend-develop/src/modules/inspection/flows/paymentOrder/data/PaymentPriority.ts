import { SelectItem } from "@/entities";

export enum PaymentPriorityProps {
  veryHigh = 'veryHigh',
  high = 'high',
  normal = 'normal',
}

export const PaymentPriority: SelectItem<PaymentPriorityProps>[] = [
  {
    label: "خیلی فوری",
    value: PaymentPriorityProps.veryHigh,
  },
  {
    label: "فوری",
    value: PaymentPriorityProps.high,
  },
  {
    label: "معمولی",
    value: PaymentPriorityProps.normal,
  },
];
