import apiClient from "@/api/client";

async function getCertificateFile(certificateId: string): Promise<Blob> {
  return await apiClient.send({
    method: "get",
    url: `/personnel-expertise/certificate/${certificateId}`,
    responseType: "blob",
  });
}

export { getCertificateFile };
