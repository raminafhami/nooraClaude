"use client";

import { memo } from "react";
import { FaTriangleExclamation } from "react-icons/fa6";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";

function ReferrerNote({
	assigneeKey,
	noteId,
	noteContent,
	noteType = "info",
}: {
	assigneeKey: string;
	noteId?: string;
	noteContent?: string;
	noteType?: "info" | "danger";
}) {
	const {
		task: { data },
	} = useTaskContext();

	const name = data["Assignees"]?.[assigneeKey]?.name;
	const note = noteId ? data[noteId] : noteContent;

	return (
		name &&
		note && (
			<div className="col-span-full">
				<Alert variant={noteType === "danger" ? "destructive" : noteType}>
					<FaTriangleExclamation />
					<AlertTitle>توضیحات {name}:</AlertTitle>
					<AlertDescription className="whitespace-pre-wrap">
						{note}
					</AlertDescription>
				</Alert>
			</div>
		)
	);
}

export default memo(ReferrerNote);
