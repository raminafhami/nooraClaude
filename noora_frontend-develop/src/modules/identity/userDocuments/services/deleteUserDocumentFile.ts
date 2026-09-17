import apiClient from "@/api/client";

interface DeleteUserDocumentsFileProps {
  fileId: string;
}

export default async function DeleteUserDocumentsFile({
  fileId,
}: DeleteUserDocumentsFileProps) {
  let response;
  let link = `user-files/${fileId}`;

  response = await apiClient.delete({
    url: link,
  });

  return response;
}
