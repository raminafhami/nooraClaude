type FormShare = {
	id: string;
	responseId: string;
	sharedBy: string;
	sharedWith: string;
	message?: string | null;
	sender?: { id: string; name: string; lastname: string };
	recipient?: { id: string; name: string; lastname: string };
	createdAt: string;
};

export type { FormShare };
