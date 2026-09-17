import apiClient from "../client";

interface DeleteInspectionFileProps {
  id: string;
}

export default async function DeleteInspectionFile({
  id,
}: DeleteInspectionFileProps) {
  let response;
  let link = `files/inspection/${id}`;

  response = await apiClient.delete({
    url: link,
  });

  return response;
}
