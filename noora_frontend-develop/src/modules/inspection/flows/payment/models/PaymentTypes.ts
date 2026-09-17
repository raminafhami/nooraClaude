import { SelectItem } from "@/entities/SelectItem";

enum PaymentType {
  Cash = "cash",
  BankDeposit = "bank-deposit",
  BankGateway = "bank-gateway",
}

const paymentType: {
  [key in PaymentType]: { title: string; isVisible: boolean };
} = {
  [PaymentType.Cash]: {
    title: "نقدی",
    isVisible: true,
  },
  [PaymentType.BankDeposit]: {
    title: "واریز بانکی",
    isVisible: true,
  },
  [PaymentType.BankGateway]: {
    title: "درگاه بانکی",
    isVisible: false,
  },
};

const paymentTypeOptions: SelectItem<PaymentType>[] = Object.keys(paymentType)
  // .filter((k) => paymentType[k as PaymentType].isVisible)
  .map((k) => {
    const key = k as PaymentType;
    return {
      label: paymentType[key].title,
      value: key,
      visible: paymentType[key].isVisible,
    };
  });

export { PaymentType, paymentType, paymentTypeOptions };
