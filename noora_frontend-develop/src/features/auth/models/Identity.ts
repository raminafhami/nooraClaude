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
};

export type { Identity };
