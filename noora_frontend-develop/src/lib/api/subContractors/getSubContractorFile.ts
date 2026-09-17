import apiClient from "../client";

interface getSubContractorFileProps {
  fileId: string;
}

export default async function getSubContractorFile({
  fileId,
}: getSubContractorFileProps) {
  let response;
  let link = `sub-contractor/${fileId}/file`;

  response = await apiClient.send({
    url: link,
    responseType: "blob",
  });

  return response;
}
