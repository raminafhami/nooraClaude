import apiClient from "../client";

interface PutOwnSettingsProps {
  value: { [key: string]: string };
}

export default async function PutOwnSettings({ value }: PutOwnSettingsProps) {
  let response;
  let link = `settings/own/`;

  response = await apiClient.put({
    url: link,
    body: {
      value,
    },
  });

  return response;
}
