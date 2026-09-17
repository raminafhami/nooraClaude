import apiClient from "@/api/client";

import { UserApi } from "../models/User";

type UpdateUserBankInfoDto = {
	title: string;
	bankName: string;
	bankBranch?: string;
	bankAccountOwner?: string;
	bankAccountNumber?: string;
	bankCardNumber: string;
	bankSheba?: string;
};

type UpdateUserBankInfoApi = UpdateUserBankInfoDto;

async function updateUserBankInfo(
	userId: string,
	bankInfoId: string,
	details: UpdateUserBankInfoDto,
): Promise<UserApi> {
	const data: UpdateUserBankInfoApi = {
		title: details.title.trim(),
		bankName: details.bankName.trim(),
		bankBranch: details.bankBranch?.trim(),
		bankAccountOwner: details.bankAccountOwner?.trim(),
		bankAccountNumber: details.bankAccountNumber?.trim(),
		bankCardNumber: details.bankCardNumber.trim(),
		bankSheba: details.bankSheba?.trim(),
	};

	const respone = await apiClient.put<UserApi>({
		url: `users/${userId}/bank-info/${bankInfoId}`,
		body: data,
	});

	return respone.result;
}

export { updateUserBankInfo };
