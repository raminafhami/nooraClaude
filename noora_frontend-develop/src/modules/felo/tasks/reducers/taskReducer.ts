import { HookList } from "@/models/Hook";

import { Task } from "../models/Task";

type TaskHookActions = "submit" | "pre-submit";

type TaskHookValues = {
	task: Task;
	data: any;
};

class TaskHooks extends HookList<TaskHookActions, TaskHookValues> {}

type TaskProps = {
	hooks: TaskHooks;
	options: any;
	footer?: React.ReactNode;
};

type TaskActionBase = {
	type: string;
};

interface TaskActionUpdate extends TaskActionBase {
	type: "update";
	options: any;
}

interface TaskActionFooter extends TaskActionBase {
	type: "footer";
	children: React.ReactNode;
}

type TaskAction = TaskActionUpdate | TaskActionFooter;

function taskReducer(details: TaskProps, action: TaskAction): TaskProps {
	switch (action.type) {
		case "footer":
			return { ...details, footer: action.children };
		case "update":
			return { ...details, options: { ...details.options, ...action.options } };
		default:
			return details;
	}
}

export type { TaskAction };
export { TaskHooks, taskReducer };
