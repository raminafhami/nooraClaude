"use client";

import { useContext } from "react";

import {
  TaskInnerContext,
  TaskInnerContextType,
} from "../contexts/TaskInnerContext";
import { TaskOuterContextType } from "../contexts/TaskOuterContext";
import { useTaskOuterContext } from "./useTaskOuterContext";

type UseTaskReturn = TaskOuterContextType & TaskInnerContextType;

function useTaskContext(): UseTaskReturn {
	const outerContext = useTaskOuterContext();

	const innerContext = useContext(TaskInnerContext);

	if (!innerContext) {
		throw new Error("useTaskContext must be used within a TaskInnerContext.");
	}

	return { ...outerContext, ...innerContext };
}

export { useTaskContext };
