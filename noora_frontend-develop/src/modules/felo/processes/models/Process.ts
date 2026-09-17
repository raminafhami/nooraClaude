import { ProcessStage } from "./ProcessStage";
import { ProcessStarters } from "./ProcessStarters";

export interface Process {
	id: string;
	key: string;
	name: string;
	version: number;
	starters: ProcessStarters;
	maxPossibleDuration?: string | null;
	createdAt: string;
	stages: ProcessStage[];
	useCN: boolean;
}
