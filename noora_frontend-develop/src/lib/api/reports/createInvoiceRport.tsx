import apiClient from "../client";

interface CreateInvoiceRportProps {
  startDate: string;
  endDate: string;
  definitionKey: string[];
  period: string;
}

export default async function createInvoiceRport({
  definitionKey,
  endDate,
  period,
  startDate,
}: CreateInvoiceRportProps) {
  let response;
  let link = `process-instances/report`;

  response = await apiClient.post({
    url: link,
    body: {
      definitionKey,
      endDate,
      period,
      startDate,
    },
  });

  return response;
}
