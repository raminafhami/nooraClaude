export enum PaymentRuleMethod {
  Total = "total",
  Remaining = "remaining",
}

export const paymentRuleMethod: { [key in PaymentRuleMethod]: string } = {
  [PaymentRuleMethod.Total]: "کل هزینه",
  [PaymentRuleMethod.Remaining]: "پس از کسورات",
};

export const paymentRuleMethods: { label: string; value: PaymentRuleMethod }[] =
  Object.keys(paymentRuleMethod).map((k) => {
    const key = k as PaymentRuleMethod;
    return { label: paymentRuleMethod[key], value: key };
  });
