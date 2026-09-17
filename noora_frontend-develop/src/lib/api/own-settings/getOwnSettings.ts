import apiClient from "../client";

export default async function GetOwnSettings() {
  let response;
  let link = `settings/own`;

  response = await apiClient.get({
    url: link,
  });

  return response;
}
