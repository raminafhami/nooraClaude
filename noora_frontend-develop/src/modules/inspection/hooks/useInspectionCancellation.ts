import { useEffect } from "react";
import { useFormContext } from "react-hook-form";

import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { isFieldInTaskData } from "@/felo/tasks/utils/isFieldInTaskData";
import { isFieldInTaskForm } from "@/felo/tasks/utils/isFieldInTaskForm";
import { isReopenedTask } from "@/felo/tasks/utils/isReopenedTask";

interface UseInspectionCancellationDto {
	statusId: string;
	defaultStatus?: string;
}

function useInspectionCancellation(options: UseInspectionCancellationDto) {
	const { statusId, defaultStatus = "forward" } = options;

	const { task } = useTaskContext();

	const { setValue } = useFormContext();

	useEffect(() => {
		if (
			!isFieldInTaskForm(task, statusId) &&
			!isFieldInTaskData(task, statusId) &&
			isReopenedTask(task)
		) {
			setValue(statusId, defaultStatus);
		}
	}, [defaultStatus, setValue, statusId, task]);
}

export { useInspectionCancellation };
