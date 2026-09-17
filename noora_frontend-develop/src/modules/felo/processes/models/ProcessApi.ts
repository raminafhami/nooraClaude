import { ProcessStage } from "./ProcessStage";
import { ProcessStarters } from "./ProcessStarters";

export interface ProcessApi {
	id: string;
	key: string;
	name: string;
	version: number;
	candidateStarter: ProcessStarters;
	maxPossibleDuration?: string | null;
	createdAt: string;
	stages: ProcessStage[];
	useCN?: boolean;
}
