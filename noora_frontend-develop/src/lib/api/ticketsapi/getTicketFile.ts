import apiClient from "../client";

interface GetTicketFileProps {
  ticketId: string;
  fileId: string;
}

export default async function GetTicketFile({
  fileId,
  ticketId,
}: GetTicketFileProps) {
  let response;

  let link = `tickets/${ticketId}/messages/file/${fileId}`;

  response = await apiClient.send({
    url: link,
    responseType: "blob",
  });

  return response;
}
