import apiClient from "../client";

interface PostNewTicketsMessageProps {
  ticketId: string;
  file?: any | null;
  content?: string | null;
}

export default async function PostNewTicketsMessage({
  ticketId,
  content,
  file,
}: PostNewTicketsMessageProps) {
  let response;
  let link = `tickets/${ticketId}/messages`;

  response = await apiClient.post({
    url: link,
    body: {
      file,
      content,
    },
    contentType: "multipart",
  });

  return response;
}
