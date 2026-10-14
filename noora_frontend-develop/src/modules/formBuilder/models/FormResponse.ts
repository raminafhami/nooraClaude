type FormResponse = {
	id: string;
	occurrenceId: string;
	formId: string;
	userId: string;
	versionId: string;
	answers: Record<string, unknown>;
	status: "draft" | "completed";
	revision: number;
	lastSavedAt?: string | null;
	submittedAt?: string | null;
	completerName?: string | null;
	signatureBase64?: string | null;
	signedAt?: string | null;
};

export type { FormResponse };
