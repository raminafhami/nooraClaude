import apiClient from "../client";

interface PostAssetRequirementFileProps {
  id: string;
  title: string;
  file: any;
}

export default async function PostAssetRequirementFile({
  id,
  title,
  file,
}: PostAssetRequirementFileProps) {
  let response;
  let link = `asset-requirement/${id}/file`;

  response = await apiClient.post({
    url: link,
    body: {
      title,
      file,
    },
    contentType: "multipart",
  });

  return response;
}
