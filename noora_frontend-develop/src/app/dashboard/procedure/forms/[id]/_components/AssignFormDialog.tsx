"use client";

import moment from "moment-jalaali";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/ui/date-input";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

import {
	FORM_ASSIGNMENT_FREQUENCY_LABELS,
	FormAssignmentFrequency,
} from "@/formBuilder/enums/FormAssignmentFrequency";
import {
	AssignmentResult,
	createFormAssignments,
} from "@/formBuilder/services/createFormAssignments";

import AssignUserAudit, {
	Person,
} from "../../../_components/modules/AssignUserAudit";

function toIsoDate(jalaliDate: string): string | undefined {
	if (!jalaliDate) return undefined;
	const parsed = moment(jalaliDate, "jYYYY/jMM/jDD");
	return parsed.isValid() ? parsed.toISOString() : undefined;
}

function AssignFormDialog({
	payload,
	open,
	onClose,
}: {
	payload: { formId: string };
	open: boolean;
	onClose: (result?: AssignmentResult[]) => Promise<void>;
}) {
	const [selectedUsers, setSelectedUsers] = useState<Person[]>([]);
	// Optional: "no schedule" means the form is filled whenever needed.
	const [frequency, setFrequency] = useState<FormAssignmentFrequency>(
		FormAssignmentFrequency.NoSchedule,
	);
	const [startDate, setStartDate] = useState("");
	const [dueDate, setDueDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	async function handleSubmit() {
		if (!selectedUsers.length) {
			toast.warning("حداقل یک نفر از پرسنل را انتخاب کنید.");
			return;
		}
		try {
			setIsSubmitting(true);
			const results = await createFormAssignments(payload.formId, {
				userIds: selectedUsers.map((u) => u.id),
				frequency,
				// Optional: the server starts the assignment now when omitted.
				startDate: toIsoDate(startDate),
				dueDate:
					frequency === FormAssignmentFrequency.Once
						? toIsoDate(dueDate)
						: undefined,
				endDate: toIsoDate(endDate),
			});

			const succeeded = results.filter((r) => r.success).length;
			const failed = results.filter((r) => !r.success);

			if (succeeded) {
				toast.success(`فرم با موفقیت به ${succeeded} نفر تخصیص داده شد.`);
			}
			failed.forEach((f) => {
				const user = selectedUsers.find((u) => u.id === f.userId);
				toast.error(
					`${user ? `${user.name} ${user.lastname}` : f.userId}: ${f.message}`,
				);
			});

			await onClose(results);
		} catch (err: any) {
			toast.error(err?.message || "خطا در تخصیص فرم.");
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={() => !isSubmitting && onClose()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>تخصیص فرم به پرسنل</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col gap-4">
					<div className="flex flex-col gap-2">
						<Label>پرسنل</Label>
						<AssignUserAudit setIds={setSelectedUsers} ids={selectedUsers} />
					</div>

					<div className="flex flex-col gap-2">
						<Label>تناوب (اختیاری)</Label>
						<Select
							value={frequency}
							onValueChange={(v) => setFrequency(v as FormAssignmentFrequency)}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{Object.values(FormAssignmentFrequency).map((f) => (
									<SelectItem key={f} value={f}>
										{FORM_ASSIGNMENT_FREQUENCY_LABELS[f]}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="flex flex-col gap-2">
						<Label>تاریخ شروع (اختیاری - پیش‌فرض: امروز)</Label>
						<DateInput
							value={startDate}
							onChange={(v) => setStartDate(v as string)}
						/>
					</div>

					{frequency === FormAssignmentFrequency.Once && (
						<div className="flex flex-col gap-2">
							<Label>سررسید (اختیاری)</Label>
							<DateInput
								value={dueDate}
								onChange={(v) => setDueDate(v as string)}
							/>
						</div>
					)}

					{frequency !== FormAssignmentFrequency.NoSchedule && (
						<div className="flex flex-col gap-2">
							<Label>تاریخ پایان (اختیاری)</Label>
							<DateInput
								value={endDate}
								onChange={(v) => setEndDate(v as string)}
							/>
						</div>
					)}
				</div>

				<DialogFooter>
					<Button type="button" disabled={isSubmitting} onClick={handleSubmit}>
						<Spinner loading={isSubmitting} size="sm">
							تخصیص
						</Spinner>
					</Button>
					<Button
						type="button"
						variant="ghost"
						disabled={isSubmitting}
						onClick={() => onClose()}
					>
						انصراف
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export { AssignFormDialog };
