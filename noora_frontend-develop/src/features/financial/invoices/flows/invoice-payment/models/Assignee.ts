import { Assignee } from "@/inspection/models/Assignee";
import { ObjectType } from "@/utils/object/ObjectType";

type Assignees = Partial<ObjectType<AssigneeType, Assignee>>;

enum AssigneeType {
	Creator = "creator",
	Accountant = "accountant",
}

const assigneesTemplate: ObjectType<AssigneeType, string> = {
	[AssigneeType.Creator]: "درخواست دهنده",
	[AssigneeType.Accountant]: "حسابدار",
};

export { AssigneeType, assigneesTemplate };
export type { Assignees };
