type Assignee = {
  id: string;
  name: string;
};

const AssigneeType = {
  Personnel: "personnel",
  HR: "hr",
  QA: "qa",
  Financial: "financial",
  CEO: "ceo",
} as const;

const assigneesTemplate: {
  [key in (typeof AssigneeType)[keyof typeof AssigneeType]]: string;
} = {
  [AssigneeType.Personnel]: "پرسنل",
  [AssigneeType.HR]: "منابع انسانی",
  [AssigneeType.QA]: "تضمین کیفیت",
  [AssigneeType.Financial]: "مالی",
  [AssigneeType.CEO]: "مدیرعامل",
};

type Assignees = Partial<{
  [key in (typeof AssigneeType)[keyof typeof AssigneeType]]: Assignee;
}>;

export { type Assignee, type Assignees, AssigneeType, assigneesTemplate };
