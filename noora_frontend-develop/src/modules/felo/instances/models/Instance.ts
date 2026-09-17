import { ProcessPhase } from "@/felo/processes/models/";
import { UserLookup } from "@/identity/users/models/UserLookup";

import { InstanceStatus } from "../enums/InstanceStatus";

type Instance = {
	id: string;
	caseNo: string;
	contractNo?: string | null;
	version: number;
	name?: string;
	processId: string;
	processKey: string;
	processName: string;
	maxPossibleDuration?: number;
	timeActivated?: number;
	processPhases?: ProcessPhase[];
	processDocuments?: object;
	phase?: ProcessPhase;
	owner?: string;
	watchers?: string[];
	status?: InstanceStatus;
	createAt?: Date;
	updateAt?: Date;
	parameters?: any;
	holdById?: string;
	holdBy?: UserLookup;
	cancelledById?: string;
	cancelledBy?: UserLookup;
	reason?: string;
	description?: string;
};

export type { Instance };
