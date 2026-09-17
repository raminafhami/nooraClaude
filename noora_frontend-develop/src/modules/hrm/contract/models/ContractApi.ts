import { UserApi } from "@/identity/users/models/User";

import { ContractStatus } from "../enums/ContractStatus";

type ContractApi = {
	contractNo: string;
	signDate: string;
	jobs: string[];
	startDate: string;
	endDate: string;
	period: number;
	salaryType: string;
	salaryAmount: number;
	status: ContractStatus;
	userId: string;
	user: {
		id: string;
		name: string;
		lastname: string;
		username: string;
		nationalCode: string;
		email: string;
		phoneNo: string;
	};
	id: string;
	workplace: string;
	bankAccountNumber: string;
	bankName: string;
	bankBranch: string;
	damages: string;
	approvers?: {
		key: string;
		title: string;
		userId: string | UserApi;
		isProxy: boolean;
	}[];
};

export type { ContractApi };
