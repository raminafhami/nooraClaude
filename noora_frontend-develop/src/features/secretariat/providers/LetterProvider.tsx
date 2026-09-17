"use client";

import { useCallback, useMemo } from "react";

import { useDialogs } from "@/components/ui/dialog/use-dialogs";
import { Instance } from "@/felo/instances/models/Instance";

import { LetterAttachmentsDialog } from "../components/letter-attachments/LetterAttachmentsDialog";
import { LetterContext } from "../contexts/LetterContext";

function LetterProvider({ children }: React.PropsWithChildren) {
	const dialogs = useDialogs();

	const handleAttachmentsDialogOpen = useCallback(
		async (instance: Instance) => {
			await dialogs.open(LetterAttachmentsDialog, {
				instanceId: instance.id,
				caseNo: instance.caseNo,
			});
		},
		[dialogs],
	);

	const contextValue = useMemo(
		() => ({ openAttachmentsDialog: handleAttachmentsDialogOpen }),
		[handleAttachmentsDialogOpen],
	);

	return (
		<LetterContext.Provider value={contextValue}>
			{children}
		</LetterContext.Provider>
	);
}

export { LetterProvider };
