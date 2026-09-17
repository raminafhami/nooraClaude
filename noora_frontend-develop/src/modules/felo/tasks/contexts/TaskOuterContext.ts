import { createContext } from "react";

import { Task } from "../models/Task";

type TaskOuterContextType = {
	task: Task;
};

const TaskOuterContext = createContext<TaskOuterContextType | null>(null);

export type { TaskOuterContextType };
export { TaskOuterContext };
