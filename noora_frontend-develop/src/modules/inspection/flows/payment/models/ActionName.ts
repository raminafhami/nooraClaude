enum ActionName {
  Receipt = "receipt",
  Invoice = "invoice",
}

const actionName: { [key in ActionName]: string } = {
  [ActionName.Receipt]: "ثبت وصول",
  [ActionName.Invoice]: "صدور فاکتور",
};

const actionNameOptions: {
  label: string;
  value: ActionName;
}[] = Object.entries(actionName).map(([key, value]) => ({
  label: value,
  value: key as ActionName,
}));

export { ActionName, actionName, actionNameOptions };
