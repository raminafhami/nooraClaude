import { SelectItem } from "@/entities";

export enum PaymentStatesProps {
  accept = 'accept',
  reject = 'reject',
}

export const PaymentStates: SelectItem<PaymentStatesProps>[] = [
  {
    label: "تایید درخواست",
    value: PaymentStatesProps.accept,
  },
  {
    label: "رد درخواست",
    value: PaymentStatesProps.reject,
  },

];
