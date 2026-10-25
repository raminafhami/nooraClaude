import { createContext, Dispatch, SetStateAction } from "react";

export interface ExpertiseAndStatus {
	title?: string;
	expertiseId: string;
	userId: string;
	status: "qualified" | "learning" | "unqualified" | null | undefined;
	organizationName?: string;
	file?: File | undefined;
	certificateDate?: string;
	// Certificate already uploaded from its own "ارسال" button.
	sent?: boolean;
}
interface JobsContextType {
	expertisesStatus: ExpertiseAndStatus[];
	setExpertisesStatus: Dispatch<SetStateAction<ExpertiseAndStatus[]>>;
}

export const JobsContext = createContext<JobsContextType>(
	{} as JobsContextType,
);
