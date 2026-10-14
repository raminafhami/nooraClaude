enum FormOccurrenceStatus {
	Pending = "pending",
	InProgress = "in_progress",
	Completed = "completed",
}

const FORM_OCCURRENCE_STATUS_LABELS: Record<FormOccurrenceStatus, string> = {
	[FormOccurrenceStatus.Pending]: "در انتظار تکمیل",
	[FormOccurrenceStatus.InProgress]: "در حال تکمیل",
	[FormOccurrenceStatus.Completed]: "تکمیل‌شده",
};

export { FormOccurrenceStatus, FORM_OCCURRENCE_STATUS_LABELS };
