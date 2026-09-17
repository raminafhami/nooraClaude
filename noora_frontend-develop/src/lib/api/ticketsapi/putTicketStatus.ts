import apiClient from "../client";

interface PutTicketStatusProps {
  id: string;
  status: string;
}

export default async function PutTicketStatus({
  id,
  status,
}: PutTicketStatusProps) {
  let response;
  let link = `tickets/${id}/status`;

  response = await apiClient.put({
    url: link,
    body: {
      status,
    },
  });

  return response;
}
