import { InstanceStatus } from "@/felo/instances/enums/InstanceStatus";
import { Instance } from "@/felo/instances/models/Instance";
import { Task } from "@/felo/tasks/models/Task";

type InstanceFilterArgs = Partial<{
	caseNo: string;
	processDefinitionKey: string;
	status: InstanceStatus | null;
	branchId: string;
	contractNo: string;
}>;

type InstanceItemType = {
	instance: Instance;
	tasks: InstanceItemTask[];
};

type InstanceItemTask = {
	task: Task;
	assigneeName?: string;
	userNames: string[];
	groupNames: string[];
};

export type { InstanceFilterArgs, InstanceItemType, InstanceItemTask };
