import apiClient from "@/api/client";

async function deleteUserBankInfo(
	id: string,
	bankInfoId: string,
): Promise<boolean> {
	await apiClient.delete({
		url: `/users/${id}/bank-info/${bankInfoId}`,
	});

	return true;
}

export { deleteUserBankInfo };
