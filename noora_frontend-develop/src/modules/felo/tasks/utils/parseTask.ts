import { TaskKind } from "../enums/TaskKind";
import { Task } from "../models/Task";
import { TaskApi } from "../models/TaskApi";

function parseTask(from: TaskApi): Task;

function parseTask(from: TaskApi[]): Task[];

function parseTask(from: TaskApi | TaskApi[]): Task | Task[] {
	if (Array.isArray(from)) {
		return from.map((x) => parseTask(x));
	}

	try {
		const result: Task = {
			id: from.id,
			taskId: from.taskId,
			caseNo: from.caseNo,
			instanceId:
				typeof from.processInstanceId === "string"
					? from.processInstanceId
					: from.processInstanceId.id,
			instanceVersion:
				typeof from.processInstanceId !== "string"
					? (from.processInstanceId.version ?? 0)
					: 0,
			instanceContractNo:
				typeof from.processInstanceId === "object"
					? from.processInstanceId.contractNo
					: undefined,
			instanceFeasibility:
				typeof from.processInstanceId === "object"
					? from.processInstanceId.feasibilityProcessInstanceId
					: undefined,
			processId: from.processDefinitionId,
			processKey: from.processDefinitionKey,
			processName: from.processDefinitionName,
			kind: from.assignee ? TaskKind.Pending : TaskKind.Candid,
			key: from.key,
			dueDate: from.dueDate,
			timeStarted: from.timeStarted,
			name: from.summary,
			userId: from.assignee,
			groups: from.candidate.groups,
			users: from.candidate.users,
			status: from.status,
			priority: from.priority,
			properties: from.properties,
			data: (() => {
				const data: any = {};
				from.data.map((field) => {
					data[field.key] = field.value;
				});

				return data;
			})(),
			parameters: from.parameters,
			createdAt: from.createdAt,
			updatedAt: from.updatedAt,
			readAt: from.readAt,
			completedAt: from.timeCompleted > 0 ? new Date(from.timeCompleted) : null,
		};

		return result;
	} catch (err: any) {
		console.info({ task: from });
		throw new Error(err);
	}
}

export { parseTask };
