import apiClient from "@/api/client";

export async function getTemplateString(
  instanceId: string,
  templateName: string,
  variables: string[],
  download: boolean = false,
): Promise<string | null> {
  const url = `files/${instanceId}/export/vars/${variables.join(
    ",",
  )}?template=${templateName}&download=${download ? "1" : "0"}`;

  return await apiClient.send({
    method: "get",
    url,
    responseType: "text",
  });
}
