import apiClient from "../client";

interface PutTicketClaimProps {
  id: string;
}

export default async function PutTicketClaim({ id }: PutTicketClaimProps) {
  let response;
  let link = `tickets/${id}/claim`;

  response = await apiClient.put({
    url: link,
  });

  return response;
}
