import apiClient from "../client";

interface DeleteAuditProps {
  id: string;
}

export default async function DeleteAudit({ id }: DeleteAuditProps) {
  let response;
  let link = `audit/${id}`;

  response = await apiClient.delete({
    url: link,
  });

  return response;
}
