"use client";

import { memo } from "react";

import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { PreviousTask } from "@/inspection/models/PreviousTask";

import Referrer from "./Referrer";

function PreviousTaskReferrer({ name }: { name?: string }) {
	const { task } = useTaskContext();

	const previousTask = task.data["PreviousTask"];

	if (!previousTask) return;

	const { assigneeKey, assigneeTitle, noteContent, noteType }: PreviousTask =
		previousTask;

	return (
		<Referrer
			assigneeKey={assigneeKey}
			title={assigneeTitle}
			noteContent={noteContent}
			noteType={noteType}
		/>
	);
}

export default memo(PreviousTaskReferrer);
