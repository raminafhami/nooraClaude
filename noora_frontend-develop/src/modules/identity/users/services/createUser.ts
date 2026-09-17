import apiClient from "@/api/client";
import { GenericObject } from "@/ts/GenericObject";

import { User, UserApi } from "../models/User";
import { UserType } from "../models/UserType";
import parseUser from "../utils/parseUser";

export interface CreateUserDto<TMetadata extends GenericObject = any> {
	type?: UserType;
	branchId: string | null;
	name: string;
	lastname: string;
	phoneNo?: string | null;
	password?: string;
	nationalCode?: string | null;
	username?: string | null;
	email?: string | null;
	groups?: string[];
	bankName?: string | null;
	bankBranch?: string | null;
	bankAccountOwner?: string | null;
	bankAccountNumber?: string | null;
	bankCardNumber?: string | null;
	bankSheba?: string | null;
	sepidarId?: string | null;
	metadata?: TMetadata;
	industryId?: string | null;
	subIndustryId?: string | null;
	referralSource?: string | null;
}

interface CreateUserApi {
	type: UserType;
	branchId: string | null;
	name: string;
	lastname: string;
	phoneNo: string | null;
	password: string;
	nationalCode: string | null;
	username: string | null;
	email: string | null;
	groups: string[];

	sepidarId: string | null;
	metadata: any;
	industryId: string | undefined;
	subIndustryId: string | undefined;
	referralSource: string | undefined;
}

export default async function createUser<TMetadata extends GenericObject = any>(
	details: CreateUserDto<TMetadata>,
): Promise<User<TMetadata>> {
	const data: CreateUserApi = {
		type: details.type ?? UserType.Public,
		branchId: details.branchId,
		name: details.name.trim(),
		lastname: details.lastname.trim(),
		phoneNo: details.phoneNo?.trim() || null,
		password: details.password?.trim() || "1234",
		nationalCode: details.nationalCode?.trim() || null,
		username: details.username?.trim() || null,
		email: details.email?.trim() || null,
		groups: ((initialGroups, branchId) => {
			const groups = initialGroups ?? [];

			const branchGroup = groups.at(0);
			if (branchId && (!branchGroup || branchGroup !== branchId)) {
				groups.unshift(branchId);
			}

			return groups;
		})(details.groups, details.branchId),

		sepidarId: details.sepidarId?.trim() || null,
		metadata: details.metadata || {},
		industryId: details.industryId || undefined,
		subIndustryId: details.subIndustryId || undefined,
		referralSource: details.referralSource || undefined,
	};

	const response = await apiClient.post<UserApi>({
		url: "/users/create-user",
		body: data,
	});

	return parseUser(response.result);
}
