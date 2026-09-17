import apiClient from "@/api/client";
import { GenericObject } from "@/ts/GenericObject";

import { User, UserApi } from "../models/User";
import parseUser from "../utils/parseUser";
import getUserById from "./getUserById";

type UpdateUserDto<TMetadata extends GenericObject = any> = {
	branchId: string | null;
	name: string;
	lastname: string;
	phoneNo: string | null;
	nationalCode: string | null;
	username: string | null;
	email: string | null;

	sepidarId: string | null;
	metadata: TMetadata;
	industryId: string | null;
	subIndustryId: string | null;
	referralSource: string | null;
};

type UpdateUserApi = {
	branchId: string | null;
	name: string;
	lastname: string;
	phoneNo: string | null;
	nationalCode: string | null;
	username: string | null;
	email: string | null;
	sepidarId: string | null;
	metadata: any;
	industryId: string | null;
	subIndustryId: string | null;
	referralSource: string | null;
};

async function updateUser<TMetadata extends GenericObject = any>(
	id: string,
	details: Partial<UpdateUserDto<TMetadata>>,
): Promise<User<TMetadata>> {
	const data: Partial<UpdateUserApi> = {
		branchId: details.branchId,
		name: details.name?.trim(),
		lastname: details.lastname?.trim(),
		phoneNo:
			typeof details.phoneNo !== "undefined"
				? details.phoneNo?.trim() || null
				: undefined,
		nationalCode:
			typeof details.nationalCode !== "undefined"
				? details.nationalCode?.trim() || null
				: undefined,
		username:
			typeof details.username !== "undefined"
				? details.username?.trim() || null
				: undefined,
		email:
			typeof details.email !== "undefined"
				? details.email?.trim() || null
				: undefined,
		sepidarId:
			typeof details.sepidarId !== "undefined"
				? details.sepidarId?.trim() || null
				: undefined,
		industryId:
			typeof details.industryId !== "undefined"
				? details.industryId?.trim() || null
				: undefined,
		subIndustryId:
			typeof details.subIndustryId !== "undefined"
				? details.subIndustryId?.trim() || null
				: undefined,
		referralSource:
			typeof details.referralSource !== "undefined"
				? details.referralSource?.trim() || null
				: undefined,
	};

	if (details.metadata) {
		const user = await getUserById(id);
		data.metadata = { ...(user.metadata ?? {}), ...details.metadata };
	}

	const response = await apiClient.put<UserApi>({
		url: `users/${id}`,
		body: data,
	});

	return parseUser(response.result);
}

export default updateUser;
