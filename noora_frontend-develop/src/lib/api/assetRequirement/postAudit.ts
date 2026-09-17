import apiClient from "../client";

interface PostAuditProps {
  title: string;
  auditNo: string;
  category: string;
  reviewNumber: string;
  date: any;
  state: boolean;
  producerId: string;
  seconderId: string;
  approverId: string;
}

export default async function PostAudit({
  approverId,
  category,
  date,
  auditNo,
  producerId,
  reviewNumber,
  seconderId,
  state,
  title,
}: PostAuditProps) {
  let response;
  let link = `audit/`;

  response = await apiClient.post({
    url: link,
    body: {
      approverId,
      category,
      date,
      auditNo,
      producerId,
      reviewNumber,
      seconderId,
      state,
      title,
    },
  });

  return response;
}
