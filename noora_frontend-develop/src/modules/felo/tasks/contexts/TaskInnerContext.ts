"use client";

import { createContext } from "react";

import { TaskAction, TaskHooks } from "../reducers/taskReducer";

interface TaskInnerContextType {
	dispatch: React.Dispatch<TaskAction>;
	hooks: TaskHooks;
	options: any;
	save: (fields: any) => Promise<void>;
	footer?: React.ReactNode;

	changeToCancel: (details: { reason: string; description?: string }) => void;
}

const TaskInnerContext = createContext<TaskInnerContextType | null>(null);

export type { TaskInnerContextType };
export { TaskInnerContext };
