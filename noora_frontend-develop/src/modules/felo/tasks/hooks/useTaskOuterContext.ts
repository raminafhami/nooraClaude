"use client";

import { useContext } from "react";

import {
  TaskOuterContext,
  TaskOuterContextType,
} from "../contexts/TaskOuterContext";

function useTaskOuterContext(): TaskOuterContextType {
	const context = useContext(TaskOuterContext);

	if (!context) {
		throw new Error(
			"useTaskOuterContext must be used within a TaskOuterContext.",
		);
	}

	return context;
}

export { useTaskOuterContext };
