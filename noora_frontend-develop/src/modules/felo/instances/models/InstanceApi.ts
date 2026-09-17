import { ProcessPhase } from "@/felo/processes/models/ProcessPhase";
import { UserLookupApi } from "@/identity/users/models/UserLookup";

import { InstanceStatus } from "../enums/InstanceStatus";

type InstanceApi = {
	id: string;
	caseNo: string;
	contractNo?: string | null;
	version: number;
	name?: string;
	processDefinitionId: string;
	processDefinitionKey: string;
	processDefinitionName: string;
	documents?: object;
	stateList?: ProcessPhase[];
	currentState?: string;
	owner?: string;
	watchers?: string[];
	status?: InstanceStatus;
	createdAt?: string;
	updatedAt?: string;
	parameters?: any;
	maxPossibleDuration?: number;
	timeActivated?: number;
	holdBy?: string | UserLookupApi;
	cancelledBy?: string | UserLookupApi;
	reason?: string;
	description?: string;
};

export type { InstanceApi };
