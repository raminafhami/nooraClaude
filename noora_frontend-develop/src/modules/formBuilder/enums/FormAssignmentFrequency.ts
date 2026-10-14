enum FormAssignmentFrequency {
	Once = "once",
	Daily = "daily",
	Weekly = "weekly",
	Monthly = "monthly",
	Quarterly = "quarterly",
	SemiAnnual = "semi_annual",
	Annual = "annual",
	NoSchedule = "no_schedule",
}

const FORM_ASSIGNMENT_FREQUENCY_LABELS: Record<FormAssignmentFrequency, string> = {
	[FormAssignmentFrequency.Once]: "یک‌باره",
	[FormAssignmentFrequency.Daily]: "روزانه",
	[FormAssignmentFrequency.Weekly]: "هفتگی",
	[FormAssignmentFrequency.Monthly]: "ماهانه",
	[FormAssignmentFrequency.Quarterly]: "هر سه ماه",
	[FormAssignmentFrequency.SemiAnnual]: "هر شش ماه",
	[FormAssignmentFrequency.Annual]: "سالانه",
	[FormAssignmentFrequency.NoSchedule]: "بدون بازه",
};

export { FormAssignmentFrequency, FORM_ASSIGNMENT_FREQUENCY_LABELS };
