import apiClient from "../client";

interface DeleteTicketsProps {
  id: string;
}

export default async function DeleteTickets({ id }: DeleteTicketsProps) {
  let response;
  let link = `tickets/${id}`;

  response = await apiClient.delete({
    url: link,
  });

  return response;
}
