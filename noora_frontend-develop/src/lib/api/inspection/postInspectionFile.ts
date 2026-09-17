import apiClient from "../client";

interface PostInspectionFileProps {
  processInstanceId: string;
  category?: string;
  description?: string;
  files: any[]; // Change to accept an array of files
}

export default async function PostInspectionFile({
  processInstanceId,
  category,
  description,
  files,
}: PostInspectionFileProps) {
  let response;
  const link = `files/inspection/${processInstanceId}/upload`;

  const formData = new FormData();
  files.forEach((file, index) => {
    formData.append(`file`, file);
  });
  formData.append("category", category || "");
  formData.append("description", description || "");

  try {
    response = await apiClient.post({
      url: link,
      body: formData,
      contentType: "multipart",
    });

    return response;
  } catch (error) {
    console.error("Error posting inspection file:", error);
    throw error;
  }
}
