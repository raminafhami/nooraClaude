import apiClient from "@/api/client";

interface VerifyContractOtpApi {
  code: string;
}

async function verifyContractOtp(code: string): Promise<boolean> {
  const data: VerifyContractOtpApi = {
    code,
  };

  const response = await apiClient.post<boolean>({
    url: "contract/verify-contract-code",
    body: data,
  });

  return response.result;
}

export { verifyContractOtp };
