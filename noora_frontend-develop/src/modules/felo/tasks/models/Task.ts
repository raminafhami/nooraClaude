import { ObjectType } from "@/utils/object/ObjectType";

import { TaskKind } from "../enums/TaskKind";
import { TaskStatus } from "../enums/TaskStatus";

type Task = {
	id: string;
	taskId: string;
	caseNo: string;
	instanceId: string;
	instanceVersion: number;
	instanceContractNo?: string;
	instanceFeasibility?: string;
	processId: string;
	processKey: string;
	processName: string;
	kind: TaskKind;
	key: string;
	name: string;
	userId: string | undefined;
	groups: string[];
	users: string[];
	status: TaskStatus;
	priority: number | null;
	properties: any;
	data: any;
	dueDate: number;
	timeStarted: number;
	parameters: ObjectType | null;
	createdAt: string;
	updatedAt: string;
	readAt: string | null;
	completedAt: Date | null;
};

export type { Task };
