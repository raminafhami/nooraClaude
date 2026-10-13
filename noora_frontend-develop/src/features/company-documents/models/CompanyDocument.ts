type CompanyDocument = {
	id: string;
	title: string;
	description: string;
	date: string;
	expiryDate?: string | null;
	fileName: string;
};

export type { CompanyDocument };
