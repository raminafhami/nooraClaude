import { UserLookup, UserLookupApi } from "../models/UserLookup";

function parseUserLookup(from: UserLookupApi): UserLookup;

function parseUserLookup(from: UserLookupApi[]): UserLookup[];

function parseUserLookup(
	from: UserLookupApi | UserLookupApi[],
): UserLookup | UserLookup[] {
	if (Array.isArray(from)) {
		return from.map((x) => parseUserLookup(x));
	}

	return {
		id: from.id,
		name: `${from.name} ${from.lastname}`.trim(),
	};
}

export { parseUserLookup };
