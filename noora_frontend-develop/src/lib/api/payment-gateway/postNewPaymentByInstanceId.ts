import apiClient from "../client";

interface PostNewPaymentByInstanceIdProps {
  processInstanceId: string;
  invoiceType: string;
  inspectionType: string;
}

export default async function postNewPaymentByInstanceId({
  processInstanceId,
  invoiceType,
  inspectionType,
}: PostNewPaymentByInstanceIdProps) {
  let response;
  let link = `payment/pay/${processInstanceId}/${invoiceType}/${inspectionType}`;

  response = await apiClient.send({
    method: "post",
    url: link,
    responseType: "text",
  });

  return response;
}
