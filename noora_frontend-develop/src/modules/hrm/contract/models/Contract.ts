import { ContractStatus } from "../enums/ContractStatus";
import { ContractApprover } from "./ContractApprover";

type Contract = {
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
	firstname: string;
	lastname: string;
	fullname: string;
	username: string;
	nationalCode: string;
	email: string;
	phoneNo: string;
	id: string;
	workplace: string;
	bankAccountNumber: string;
	bankName: string;
	bankBranch: string;
	damages: string;

	approvers?: ContractApprover[];
};

export type { Contract };
