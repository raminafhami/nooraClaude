export enum PaymentRuleType {
  Fixed = "fixed",
  Percentage = "percentage",
}

export const paymentRuleType: { [key in PaymentRuleType]: string } = {
  [PaymentRuleType.Fixed]: "ثابت",
  [PaymentRuleType.Percentage]: "درصدی",
};

export const paymentRuleTypes: { label: string; value: PaymentRuleType }[] =
  Object.keys(paymentRuleType).map((k) => {
    const key = k as PaymentRuleType;
    return { label: paymentRuleType[key], value: key };
  });
