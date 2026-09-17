import { parseBranch } from "@/branches/utils/parseBranch";

import { User, UserApi } from "../models/User";

function parseUser(from: UserApi): User;

function parseUser(from: UserApi[]): User[];

function parseUser(from: UserApi | UserApi[]): User | User[] {
	if (Array.isArray(from)) {
		return from.map((x) => parseUser(x));
	}

	const { name, branchId, metadata, ...fromRest } = from;

	const result: User = {
		...fromRest,
		firstname: name,
		fullname: `${from.name} ${from.lastname}`,
		branchId:
			from.branchId !== null
				? typeof from.branchId === "string"
					? from.branchId
					: from.branchId?.id
				: null,
		branch:
			from.branchId !== null
				? typeof from.branchId === "object"
					? parseBranch(from.branchId)
					: undefined
				: null,
		sepidarId: from.sepidarId ?? undefined,
		credit: from.credit ?? 0,
		isActive: from.isActive ?? false,
		emailConfig: from.emailConfig ?? undefined,
		metadata: from.metadata ?? {},
	};

	return result;
}

export default parseUser;
