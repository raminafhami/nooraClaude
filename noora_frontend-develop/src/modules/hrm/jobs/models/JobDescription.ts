import { JobDepartment } from "./JobDepartment";
import { JobRequirements } from "./JobRequirements";

export class JobDescription {
	id: string;
	code: string;
	name: string;
	department: JobDepartment | null;
	supervisor: string;
	definition: string;
	duties: string[];
	authorities: string[];
	requirements: JobRequirements;
	metadata?: {
		goodsInspectionField?: string;
	};
}
