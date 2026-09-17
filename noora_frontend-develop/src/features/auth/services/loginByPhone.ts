import apiClient from "@/api/client";

interface LoginByPhoneDto {
	phoneNo: string;
}

async function loginByPhone({ phoneNo }: LoginByPhoneDto) {
	const response = await apiClient.post({
		url: "/authentication/login-phone",
		body: {
			phoneNo,
		},
	});

	return response.result;
}

export default loginByPhone;
