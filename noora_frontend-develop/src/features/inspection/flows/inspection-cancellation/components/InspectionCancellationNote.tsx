"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { isFieldInTaskData } from "@/felo/tasks/utils/isFieldInTaskData";
import { isFieldInTaskForm } from "@/felo/tasks/utils/isFieldInTaskForm";

import { assigneesTemplate, AssigneeType } from "../models/Assignee";
import { ids } from "../models/Ids";

function InspectionCancellationNote({
	creator,
	manager,
	ceo,
	accountant,
}: {
	creator?: boolean;
	manager?: boolean;
	ceo?: boolean;
	accountant?: boolean;
}) {
	const { task } = useTaskContext();

	return (
		<div className="col-span-full space-y-2">
			<div>
				توضیحات{" "}
				{isFieldInTaskForm(task, ids.reason) ||
				isFieldInTaskData(task, ids.reason)
					? "تکمیلی"
					: "لغو درخواست"}
				:
			</div>
			<div className="flex w-full flex-1 gap-3">
				{creator && (
					<InspectionCancellationNoteItem
						assigneeKey={AssigneeType.Creator}
						noteId={ids.informationFormNote}
					/>
				)}
				{manager && (
					<InspectionCancellationNoteItem
						assigneeKey={AssigneeType.Manager}
						noteId={ids.informationReviewByManagerNote}
					/>
				)}
				{ceo && (
					<InspectionCancellationNoteItem
						assigneeKey={AssigneeType.Ceo}
						noteId={ids.informationReviewByCeoNote}
					/>
				)}
				{accountant && (
					<InspectionCancellationNoteItem
						assigneeKey={AssigneeType.Accountant}
						noteId={ids.informationReviewByAccountantNote}
					/>
				)}
			</div>
		</div>
	);
}

function InspectionCancellationNoteItem({
	assigneeKey,
	noteId,
}: {
	assigneeKey: AssigneeType;
	noteId: string;
}) {
	const { task } = useTaskContext();

	const { [ids.assignees]: assignees, [noteId]: note } = task.data;

	return (
		<Card className="w-full bg-gray-100">
			<CardContent className="space-y-1 px-5 py-4">
				<div className="text-muted-foreground">
					<span>{assignees[assigneeKey]?.name}</span>{" "}
					<span className="text-xs">({assigneesTemplate[assigneeKey]})</span>:
				</div>
				<div className="whitespace-pre-line leading-6">{note || "-"}</div>
			</CardContent>
		</Card>
	);
}

export { InspectionCancellationNote };
