import apiClient from "@/api/client";

interface LoginByPhoneVerifyProps {
  phoneNo: string;
  code: string;
}

export default async function loginByPhoneVerify({
  phoneNo,
  code,
}: LoginByPhoneVerifyProps) {
  let response;
  // Constructing the URL
  let link = `/authentication/verify`;

  response = await apiClient.post({
    url: link,
    body: {
      phoneNo,
      code,
    },
  });

  return response;
}
