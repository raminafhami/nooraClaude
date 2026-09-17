import { parseUserLookup } from "@/identity/users/utils/parseUserLookup";

import { Instance } from "../models/Instance";
import { InstanceApi } from "../models/InstanceApi";

function parseInstance(from: InstanceApi): Instance;

function parseInstance(from: InstanceApi[]): Instance[];

function parseInstance(
	from: InstanceApi | InstanceApi[],
): Instance | Instance[] {
	if (Array.isArray(from)) {
		return from.map((x) => parseInstance(x));
	}

	let result: Instance = {
		id: from.id,
		caseNo: from.caseNo,
		contractNo: from.contractNo,
		version: from.version,
		name: from.name,
		processId: from.processDefinitionId,
		processKey: from.processDefinitionKey,
		processName: from.processDefinitionName,
		processPhases: from.stateList,
		maxPossibleDuration: from.maxPossibleDuration,
		timeActivated: from.timeActivated,
		processDocuments: from.documents,
		phase:
			(from.currentState &&
				from.stateList &&
				from.stateList.find((x) => x.name === from.currentState)) ||
			undefined,
		owner: from.owner,
		watchers: from.watchers,
		status: from.status,
		createAt: (from.createdAt && new Date(from.createdAt)) || undefined,
		updateAt: (from.updatedAt && new Date(from.updatedAt)) || undefined,
		parameters: from.parameters ?? {},
		holdById: from.holdBy
			? typeof from.holdBy === "string"
				? from.holdBy
				: from.holdBy.id
			: undefined,
		holdBy:
			from.holdBy && typeof from.holdBy === "object"
				? parseUserLookup(from.holdBy)
				: undefined,
		cancelledById: from.cancelledBy
			? typeof from.cancelledBy === "string"
				? from.cancelledBy
				: from.cancelledBy.id
			: undefined,
		cancelledBy:
			from.cancelledBy && typeof from.cancelledBy === "object"
				? parseUserLookup(from.cancelledBy)
				: undefined,
		reason: from.reason,
		description: from.description,
	};

	return result;
}

export { parseInstance };
