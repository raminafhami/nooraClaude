"use client";

import { useCallback } from "react";

import { useDialogs } from "@/components/ui/dialog/use-dialogs";

import { TaskCancelDialog } from "../components/TaskCancelDialog";
import { useTaskContext } from "./useTaskContext";

type UseTaskCancelReturn = {
	openTaskCancelDialog: () => Promise<{
		reason: string;
		description?: string;
	}>;
};

function useTaskCancel(): UseTaskCancelReturn {
	const dialogs = useDialogs();

	const { changeToCancel } = useTaskContext();

	const handleDialogOpen = useCallback(async () => {
		const result = await dialogs.open(TaskCancelDialog);

		if (!result) {
			throw new Error("cancellation-confirm");
		}

		changeToCancel({ ...result });

		return result;
	}, [changeToCancel, dialogs]);

	return { openTaskCancelDialog: handleDialogOpen };
}

export { useTaskCancel };
