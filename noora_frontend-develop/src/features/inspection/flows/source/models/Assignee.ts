import { Assignee } from "@/inspection/models/Assignee";
import { ObjectType } from "@/utils/object/ObjectType";

const AssigneeType = {
	Customer: "customer",
	Coordinator: "coordinator",
	Marketer: "marketer",
	Expert: "expert",
	Manager: "manager",
	InspectionCoordinator: "inspectionCoordinator",
} as const;

type AssigneeType = (typeof AssigneeType)[keyof typeof AssigneeType];

type Assignees = Partial<ObjectType<AssigneeType, Assignee | null>>;

const assigneesTemplate: ObjectType<AssigneeType, string> = {
	[AssigneeType.Customer]: "مشتری",
	[AssigneeType.Coordinator]: "هماهنگ کننده",
	[AssigneeType.Marketer]: "بازاریاب",
	[AssigneeType.Expert]: "کارشناس",
	[AssigneeType.Manager]: "مدیر",
	[AssigneeType.InspectionCoordinator]: "هماهنگ کننده بازرسی",
};

export { AssigneeType, assigneesTemplate };
export type { Assignees };
