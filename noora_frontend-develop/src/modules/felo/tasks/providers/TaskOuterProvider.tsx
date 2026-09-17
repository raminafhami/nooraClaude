"use client";

import { TaskOuterContext } from "../contexts/TaskOuterContext";
import { Task } from "../models/Task";

function TaskOuterProvider({
	children,
	task,
}: React.PropsWithChildren<{ task: Task }>) {
	return (
		<TaskOuterContext.Provider value={{ task }}>
			{children}
		</TaskOuterContext.Provider>
	);
}

export { TaskOuterProvider };
