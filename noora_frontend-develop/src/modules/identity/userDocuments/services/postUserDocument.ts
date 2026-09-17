import apiClient from "@/api/client";

interface PostUserDocumentProps {
  userId: string;
  title: string;
  status: string;
  key?: string;
  file: File;
}

export default async function PostUserDocument({
  title,
  status,
  file,
  key,
  userId,
}: PostUserDocumentProps) {
  let response;
  let link = `user-files/${userId}`;

  response = await apiClient.post({
    url: link,
    body: {
      title,
      status,
      file,
      key,
    },
    contentType: "multipart",
  });

  return response;
}
