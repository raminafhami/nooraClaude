enum CostPersonType {
  User = "user",
  Other = "other",
}

const costPersonType: { [key in CostPersonType]: { title: string } } = {
  [CostPersonType.User]: { title: "پرسنل / نماینده / مشتری" },
  [CostPersonType.Other]: { title: "سایر" },
};

const costPersonTypeOptions: { label: string; value: CostPersonType }[] =
  Object.entries(costPersonType).map(([key, { title }]) => ({
    label: title,
    value: key as CostPersonType,
  }));

export { CostPersonType, costPersonType, costPersonTypeOptions };
