export interface Assignee {
  id: string;
  name: string;
}

export const AssigneeType = {
  Admin: "admin",
  Coordinator: "coordinator",
  Customer: "customer",
  InspectionCoordinator: "inspectionCoordinator",
  Manager: "manager",
  Marketer: "marketer",
  SeniorExpert: "seniorExpert",
  TechnicalExpert: "technicalExpert",
  TechnicalManager: "technicalManager",
} as const;

export const assigneesTemplate: {
  [key in (typeof AssigneeType)[keyof typeof AssigneeType]]: string;
} = {
  [AssigneeType.Admin]: "ادمین",
  [AssigneeType.Coordinator]: "هماهنگ کننده",
  [AssigneeType.Customer]: "مشتری",
  [AssigneeType.InspectionCoordinator]: "هماهنگ کننده بازرسی",
  [AssigneeType.Manager]: "مدیر",
  [AssigneeType.Marketer]: "بازاریاب",
  [AssigneeType.SeniorExpert]: "کارشناس ارشد",
  [AssigneeType.TechnicalExpert]: "کارشناس فنی",
  [AssigneeType.TechnicalManager]: "مدیر فنی",
};

export type Assignees = Partial<{
  [key in (typeof AssigneeType)[keyof typeof AssigneeType]]: Assignee;
}>;
