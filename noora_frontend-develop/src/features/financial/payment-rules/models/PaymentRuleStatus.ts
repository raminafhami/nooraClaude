export enum PaymentRuleStatus {
  Active = "active",
  Inactive = "inactive",
}

export const paymentRuleStatus: { [key in PaymentRuleStatus]: string } = {
  [PaymentRuleStatus.Active]: "فعال",
  [PaymentRuleStatus.Inactive]: "غیرفعال",
};
