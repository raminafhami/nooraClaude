import { Assignee } from "@/inspection/models/Assignee";
import { ObjectType } from "@/utils/object/ObjectType";

type Assignees = Partial<ObjectType<AssigneeType, Assignee>>;

const AssigneeType = {
	Creator: "creator",
	Reviewer: "reviewer",
} as const;

type AssigneeType = (typeof AssigneeType)[keyof typeof AssigneeType];

const assigneesTemplate: ObjectType<AssigneeType, string> = {
	[AssigneeType.Creator]: "درخواست دهنده",
	[AssigneeType.Reviewer]: "بررسی کننده",
} as const;

export { AssigneeType, assigneesTemplate };
export type { Assignees };
