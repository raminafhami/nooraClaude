export const assigneeKeys = [
  "Author",
  "Approver",
  "Manager",
  "Director",
  "Secretary",
] as const;

export type AssigneeKey = (typeof assigneeKeys)[number];

type AssigneeTemplate = {
  label: string;
};

export type AssigneesTemplate = {
  [key in AssigneeKey]: AssigneeTemplate;
};

export const assigneesTemplate: AssigneesTemplate = {
  Author: { label: "ایجاد کننده" },
  Approver: { label: "تاییده کننده" },
  Director: { label: "مدیرعامل" },
  Manager: { label: "مدیر بخش" },
  Secretary: { label: "دبیرخانه" },
};

export interface Assignee {
  id: string;
  name: string;
}

export type Assignees = Partial<{
  [key in AssigneeKey]: Partial<Assignee>;
}>;
