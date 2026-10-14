import { FormVersionStatus } from "../enums/FormVersionStatus";
import { FormQuestion } from "./FormQuestion";

type FormVersion = {
	id: string;
	formId: string;
	versionNo: number;
	status: FormVersionStatus;
	questions: FormQuestion[];
	publishedAt?: string | null;
	createdAt?: string;
};

export type { FormVersion };
