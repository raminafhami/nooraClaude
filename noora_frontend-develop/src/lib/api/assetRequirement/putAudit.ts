import { User } from "@/identity/users/models/User";

import apiClient from "../client";

interface PutAuditProps {
  title: string;
  auditNo: string;
  category: string;
  reviewNumber: string;
  date: any;
  state: boolean;
  producerId: string;
  seconderId: string;
  approverId: string;
  id: string;
  changeDescription?: string;
  users?: string[];
  userGroups?: string[];
}

export default async function PutAudit({
  approverId,
  category,
  date,
  auditNo,
  producerId,
  reviewNumber,
  seconderId,
  state,
  title,
  id,
  changeDescription,
  users,
  userGroups,
}: PutAuditProps) {
  let response;
  let link = `audit/${id}`;

  response = await apiClient.put({
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
      changeDescription,
      users,
      userGroups,
    },
  });

  return response;
}
