import apiClient from "../client";

interface ChangeLoginTypeProps {
  loginType: "all" | "password" | "otp";
}

export default async function changeLoginType({
  loginType,
}: ChangeLoginTypeProps) {
  let response;
  let link = `users/change-logintype`;

  response = await apiClient.patch({
    url: link,
    body: {
      loginType,
    },
  });

  return response;
}
