import apiClient from "@/api/client";

interface GenerateTemplateDto {
  name: string;
  output: string;
  data: object;
  download: boolean;
}

interface GenerateTemplateApi {
  templateName: string;
  outputFileName: string;
  data: object;
  download: boolean;
}

async function generateTemplate(
  details: Omit<GenerateTemplateDto, "download"> & { download: false },
): Promise<string>;
async function generateTemplate(
  details: Omit<GenerateTemplateDto, "download"> & { download: true },
): Promise<Blob>;
async function generateTemplate(
  details: GenerateTemplateDto,
): Promise<string | Blob> {
  const data: GenerateTemplateApi = {
    templateName: details.name,
    outputFileName: details.output,
    data: details.data,
    download: details.download,
  };

  if (details.download) {
    return await apiClient.send({
      url: "/template/generate",
      method: "post",
      body: data,
      responseType: "blob",
    });
  }

  return await apiClient.send({
    url: "/template/generate",
    method: "post",
    body: data,
    responseType: "text",
  });
}

export default generateTemplate;
