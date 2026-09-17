import { ObjectType } from "@/utils/object/ObjectType";

import { TaskStatus } from "../enums/TaskStatus";

type TaskApi = {
	id: string;
	taskId: string;
	caseNo: string;
	assignee: string | undefined;
	candidate: {
		groups: string[];
		users: string[];
	};
	key: string;
	status: TaskStatus;
	summary: string;
	data: any[];
	subForms: any[] | undefined;
	history: any[] | undefined;
	parameters: ObjectType | null;
	properties: any;
	processInstanceId:
		| string
		| {
				id: string;
				version?: number;
				contractNo?: string;
				feasibilityProcessInstanceId?: string;
		  };
	processDefinitionId: string;
	dueDate: number;
	timeStarted: number;
	processDefinitionKey: string;
	processDefinitionName: string;
	priority: number | null;
	createdAt: string;
	updatedAt: string;
	readAt: string | null;
	timeCompleted: number;
};

export type { TaskApi };
