import { Assignee } from "@/inspection/models/Assignee";

type Assignees = Partial<Record<AssigneeType, Assignee>>;

enum AssigneeType {
	Creator = "creator",
	Manager = "manager",
	Executor = "executor",
}

const assigneesTemplate: Record<AssigneeType, string> = {
	[AssigneeType.Creator]: "درخواست دهنده",
	[AssigneeType.Manager]: "مدیر بخش",
	[AssigneeType.Executor]: "اجرا کننده",
};

export { AssigneeType, assigneesTemplate };
export type { Assignees };
