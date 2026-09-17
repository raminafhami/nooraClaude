import { Branch, BranchApi } from "@/branches/models/Branch";
import { Personnel } from "@/hrm/personnel/models/Personnel";
import { UserGroup } from "@/identity/groups/models/Group";
import { Industry } from "@/industries/models/Industry";
import { GenericObject } from "@/ts/GenericObject";

import { UserBankInfo } from "./UserBankInfo";
import { UserFile } from "./UserFile";
import { UserType } from "./UserType";

export interface User<TMetadata extends GenericObject = any> {
	id: string;
	type: UserType;
	username: string;
	firstname: string;
	lastname: string;
	fullname: string;
	nationalCode: string;
	phoneNo: string;
	email: string;
	branchId: string | null;
	branch?: Branch | null;
	groups: string[] | UserGroup[];
	bankInfos?: UserBankInfo[];
	sepidarId?: string;
	industryId?: Industry | string;
	subIndustryId?: Industry | string;
	credit: number;
	referralSource?: string;
	isActive: boolean;
	loginType: "all" | "password" | "otp";
	emailConfig?: { user: string; encryptedPassword: string } | undefined;
	image?: UserFile<"avatar"> | null;
	metadata: TMetadata;
	personnel?: Personnel[];
}

export interface UserApi {
	id: string;
	type: UserType;
	username: string;
	name: string;
	lastname: string;
	nationalCode: string;
	phoneNo: string;
	email: string;
	branchId: string | BranchApi | null;
	groups: string[] | UserGroup[];
	credit: number;
	bankInfos?: UserBankInfo[];
	sepidarId: string | null;
	isActive: boolean;
	loginType: "all" | "password" | "otp";
	emailConfig?: { user: string; encryptedPassword: string } | undefined;
	image?: UserFile<"avatar"> | null;
	industryId?: Industry | string;
	subIndustryId?: Industry | string;
	metadata: any;
	referralSource?: string;
	personnel?: Personnel[];
}
