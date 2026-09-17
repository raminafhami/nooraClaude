import { Assignee } from "@/inspection/models/Assignee";
import { ObjectType } from "@/utils/object/ObjectType";

type Assignees = ObjectType<AssigneeType, Assignee>;

enum AssigneeType {
	Creator = "creator",
	Manager = "manager",
	Ceo = "ceo",
	Accountant = "accountant",
}

const assigneesTemplate: ObjectType<AssigneeType, string> = {
	[AssigneeType.Creator]: "درخواست دهنده",
	[AssigneeType.Manager]: "مدیر بخش",
	[AssigneeType.Ceo]: "مدیرعامل",
	[AssigneeType.Accountant]: "حسابدار",
};

export { AssigneeType, assigneesTemplate };
export type { Assignees };
