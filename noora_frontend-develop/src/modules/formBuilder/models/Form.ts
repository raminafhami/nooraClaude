import { FormStatus } from "../enums/FormStatus";
import { FormCategory } from "./FormCategory";
import { FormVersionStatus } from "../enums/FormVersionStatus";

type FormVersionSummary = {
	id: string;
	versionNo: number;
	status: FormVersionStatus;
	publishedAt?: string | null;
};

type Form = {
	id: string;
	code: string;
	title: string;
	categoryId: string;
	category?: FormCategory;
	description?: string | null;
	status: FormStatus;
	publishedVersionId?: string | null;
	draftVersionId?: string | null;
	publishedVersion?: FormVersionSummary | null;
	draftVersion?: FormVersionSummary | null;
	createdBy: string;
	creator?: { id: string; name: string; lastname: string };
	createdAt: string;
};

export type { Form, FormVersionSummary };
