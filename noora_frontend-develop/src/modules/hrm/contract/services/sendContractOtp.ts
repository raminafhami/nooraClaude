import apiClient from "@/api/client";

type SendContractOtpResponse = {
  expireInSeconds: number;
};

type SendContractOtpReturn = {
  expireInSeconds: number;
};

async function sendContractOtp(): Promise<SendContractOtpReturn> {
  const response = await apiClient.get<SendContractOtpResponse>({
    url: "sms/send-contract-verification-code",
  });

  return response.result;
}

export { sendContractOtp };
