import apiClient from "@/api/client";

interface InstanceFileTransferModel {
  sourceInstanceId: string;
  destinationInstanceId: string;
  files: {
    sourceFieldName: string;
    destinationFieldName: string;
    destinationFolder: string;
  }[];
}

interface InstanceFileTransferApiModel {
  sourceInstanceId: string;
  destinationInstanceId: string;
  files: {
    sourceFieldName: string;
    destinationFieldName: string;
    destinationFolder: string;
  }[];
}

export async function transferInstanceFiles({
  sourceInstanceId,
  destinationInstanceId,
  files,
}: InstanceFileTransferModel): Promise<void> {
  if (!sourceInstanceId || !destinationInstanceId) {
    throw new TypeError(
      "invalid source/destination instance id in transferInstanceFiles()",
    );
  }

  if (files.length === 0) {
    return;
  }

  const data: InstanceFileTransferApiModel = {
    sourceInstanceId,
    destinationInstanceId,
    files,
  };

  await apiClient.post({
    url: "/files/instances/transfer",
    body: data,
  });
}
