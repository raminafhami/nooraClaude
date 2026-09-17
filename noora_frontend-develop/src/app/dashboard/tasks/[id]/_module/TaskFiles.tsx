"use client";

import { FilesWidget } from "@/felo/files/components/files-widget/FilesWidget";
import { useTaskOuterContext } from "@/felo/tasks/hooks/useTaskOuterContext";

export function TaskFiles() {
	const { task } = useTaskOuterContext();

	return <FilesWidget instanceId={task.instanceId} />;
}
