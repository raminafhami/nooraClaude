import { UserApi } from "../models/User";

function getUserFullname(
	user: Partial<Pick<UserApi, "name" | "lastname">> | null | undefined,
): string | undefined {
	return [user?.name, user?.lastname].filter(Boolean).join(" ") || undefined;
}

export { getUserFullname };
