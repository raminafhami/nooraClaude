import { Process, ProcessApi } from "../models";

export default function parseProcess(from: ProcessApi): Process;
export default function parseProcess(from: ProcessApi[]): Process[];
export default function parseProcess(
	from: ProcessApi | ProcessApi[],
): Process | Process[] {
	if (Array.isArray(from)) {
		return from.map((x) => parseProcess(x));
	}

	const result: Process = {
		id: from.id,
		key: from.key,
		name: from.name,
		version: from.version,
		starters: from.candidateStarter,
		maxPossibleDuration: from.maxPossibleDuration,
		createdAt: from.createdAt,
		stages: from.stages,
		useCN: from.useCN ?? false,
	};

	return result;
}
