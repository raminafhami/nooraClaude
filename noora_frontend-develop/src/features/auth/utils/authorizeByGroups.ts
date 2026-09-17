import { UserType } from "@/identity/users/models/UserType";

import { Identity } from "../models/Identity";

function authorizeByGroups(groupNames: string | string[]) {
	return (identity: Identity | undefined) => {
		if (!identity) {
			return false;
		}

		if (identity.type === UserType.System) {
			return true;
		}

		const hasGroup = (
			Array.isArray(groupNames) ? groupNames : [groupNames]
		).some((x) => identity.groups.includes(x));

		return hasGroup;
	};
}

export { authorizeByGroups };
