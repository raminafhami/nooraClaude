import { UserType } from "@/identity/users/models/UserType";

type Identity = {
	id: string;
	type: UserType;
	fullname: string;
	email: string;
	phoneNo: string;
	branchId: string | null;
	groups: string[];
	expireAt: Date;
	dashboardAccess?: {
		viewRoles: boolean;
		createRoles: boolean;
		editRoles: boolean;
		viewPerformanceReport: boolean;
	};
};

export type { Identity };
