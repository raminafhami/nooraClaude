import { UserType } from "@/identity/users/models/UserType";

import { Identity } from "../models/Identity";

function isAuthorized(
	identity: Identity | null | undefined,
	{
		groups,
		userIds,
		userPhoneNos,
	}: Partial<{
		groups: string[];
		userIds: string[];
		userPhoneNos: string[];
	}> = {},
) {
	if (!identity) return false;

	if (identity.type == UserType.System) return true;

	if (groups || userIds || userPhoneNos) {
		if (groups) {
			const hasGroup = groups.some((x) => identity.groups.includes(x));
			if (hasGroup) return true;
		}

		if (userIds) {
			const isUser = userIds.includes(identity.id);
			if (isUser) return true;
		}

		if (userPhoneNos) {
			const isUser = userPhoneNos.includes(identity.phoneNo);
			if (isUser) return true;
		}

		return false;
	}

	return true;
}

export { isAuthorized };
