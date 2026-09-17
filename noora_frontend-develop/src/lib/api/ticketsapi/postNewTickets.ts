import apiClient from "../client";

interface PostNewTicketsProps {
  subject: string;
  content: any;
  priority: number;
  group: string | undefined;
  reference?: string | null;
  referenceType?: string;
  deadlinedAt?: string;
  remindedAt?: string;
  indicatorKey: string;
  assignee?: string;
}

export default async function PostNewTickets({
  subject,
  priority,
  group,
  reference,
  referenceType,
  deadlinedAt,
  remindedAt,
  content,
  indicatorKey,
  assignee,
}: PostNewTicketsProps) {
  let response;
  let link = `tickets/`;

  response = await apiClient.post({
    url: link,
    body: {
      subject,
      priority,
      group,
      reference,
      referenceType,
      deadlinedAt,
      remindedAt,
      content,
      indicatorKey,
      assignee,
    },
  });

  return response;
}
