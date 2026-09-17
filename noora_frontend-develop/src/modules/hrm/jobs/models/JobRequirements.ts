import { Expertise } from "@/hrm/expertises/models/Expertise";

export interface JobRequirements {
	degree: Partial<{ level: string; name: string; field: string }>[];
	experience: Partial<{ related: string; unrelated: string }>;
	expertises: string[] | Expertise[];
	description: string;
}

export interface JobRequireMentsApi {
	degree: Partial<{ level: string; name: string; field: string }>[];
	experience: Partial<{ related: string; unrelated: string }>;
	expertises: string[] | Expertise[];
	description: string;
}
