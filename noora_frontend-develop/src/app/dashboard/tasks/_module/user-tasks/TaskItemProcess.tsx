import { memo } from "react";

import { Task } from "@/felo/tasks/models/Task";
import {
	InspectionMethod,
	inspectionMethod as inspectionMethodTypes,
} from "@/inspection/models/InspectionMethod";

export const TaskItemProcess = memo(function TaskItemProcess({
	task,
}: {
	task: Task;
}) {
	const inspectionMethod =
		task.processKey.startsWith("Inspection_Case") &&
		task.data["InspectionMethod"] &&
		inspectionMethodTypes[task.data["InspectionMethod"] as InspectionMethod];

	return (
		<div className="flex items-center gap-1">
			<span>{task.processName}</span>
			{inspectionMethod && (
				<span className="text-xs text-gray-500">({inspectionMethod})</span>
			)}
		</div>
	);
});
