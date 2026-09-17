"use client";

import { createContext, ReactNode } from "react";

import { Task } from "@/felo/tasks/models/Task";

import { Instance } from "../models/Instance";

interface InstanceContextType {
	instance: Instance;
	tasks: Task[];
}

export const InstanceContext = createContext<InstanceContextType>(
	{} as InstanceContextType,
);

interface InstanceProviderProps {
	children: ReactNode;
	instance: Instance;
	tasks: Task[];
}

export const InstanceProvider = ({
	children,
	instance,
	tasks,
}: InstanceProviderProps) => {
	return (
		<InstanceContext.Provider value={{ instance, tasks }}>
			{children}
		</InstanceContext.Provider>
	);
};
