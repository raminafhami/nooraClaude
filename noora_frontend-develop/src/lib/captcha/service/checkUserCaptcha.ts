import apiClient from "@/api/client";

interface CheckUserCaptchaProps {
  clientCode: string;
}

export default async function checkUserCaptcha({
  clientCode,
}: CheckUserCaptchaProps) {
  let response;
  let link = `authentication/verify-captcha`;

  response = await apiClient.post({
    url: link,
    body: {
      "g-recaptcha-response": clientCode,
    },
  });

  return response;
}
