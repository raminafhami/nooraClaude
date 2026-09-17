import apiClient from "../client";

interface CreatesmsProps {
  phoneNo: string;
  templateNo: number;
  messageParameters: Array<{ name: string; value: string }>;
}

export default async function createsms({
  phoneNo,
  templateNo,
  messageParameters,
}: CreatesmsProps) {
  let response;
  let link = `sms`;

  response = await apiClient.post({
    url: link,
    body: {
      templateNo,
      phoneNo,
      messageParameters,
    },
  });

  return response;
}
