import apiClient from "@/api/client";

import { UserApi } from "../models/User";

type AddUserBankInfoDto = {
	title: string;
	bankName: string;
	bankBranch?: string;
	bankAccountOwner?: string;
	bankAccountNumber?: string;
	bankCardNumber: string;
	bankSheba?: string;
};

type AddUserBankInfoApi = AddUserBankInfoDto;

async function addUserBankInfo(
	id: string,
	details: AddUserBankInfoDto,
): Promise<UserApi> {
	const data: AddUserBankInfoApi = {
		title: details.title.trim(),
		bankName: details.bankName.trim(),
		bankBranch: details.bankBranch?.trim() || undefined,
		bankAccountOwner: details.bankAccountOwner?.trim() || undefined,
		bankAccountNumber: details.bankAccountNumber?.trim() || undefined,
		bankCardNumber: details.bankCardNumber.trim(),
		bankSheba: details.bankSheba?.trim() || undefined,
	};

	const response = await apiClient.put<UserApi>({
		url: `users/${id}/bank-info`,
		body: data,
	});

	return response.result;
}

export { addUserBankInfo };
