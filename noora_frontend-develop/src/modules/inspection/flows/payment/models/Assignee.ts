export interface Assignee {
  id: string;
  name: string;
}

export const AssigneeType = {
  FinancialExpert: "financialExpert",
  Initiator: "initiator",
  Payer: "payer",
} as const;

export const assigneesTemplate: {
  [key in (typeof AssigneeType)[keyof typeof AssigneeType]]: string;
} = {
  [AssigneeType.FinancialExpert]: "کارشناس مالی",
  [AssigneeType.Initiator]: "ایجاد کننده",
  [AssigneeType.Payer]: "پرداخت کننده",
};

export type Assignees = Partial<{
  [key in (typeof AssigneeType)[keyof typeof AssigneeType]]: Assignee;
}>;
