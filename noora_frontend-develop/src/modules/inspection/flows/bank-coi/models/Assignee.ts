export interface Assignee {
  id: string;
  name: string;
}

export const AssigneeType = {
  Coordinator: "coordinator",
  Customer: "customer",
  Expert: "expert",
  InspectionCoordinator: "inspectionCoordinator",
  Manager: "manager",
  Marketer: "marketer",
} as const;

export const assigneesTemplate: {
  [key in (typeof AssigneeType)[keyof typeof AssigneeType]]: string;
} = {
  [AssigneeType.Coordinator]: "هماهنگ کننده",
  [AssigneeType.Customer]: "مشتری",
  [AssigneeType.Expert]: "کارشناس",
  [AssigneeType.InspectionCoordinator]: "هماهنگ کننده بازرسی",
  [AssigneeType.Manager]: "مدیر",
  [AssigneeType.Marketer]: "بازاریاب",
};

export type Assignees = Partial<{
  [key in (typeof AssigneeType)[keyof typeof AssigneeType]]: Assignee;
}>;
