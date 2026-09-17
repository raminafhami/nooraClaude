import { File } from "../models/File";
import { FileType } from "../models/FileType";
import { Folder } from "../models/Folder";
import { parseFileTypes } from "../utils/parseFileTypes";
import { parseFolders } from "../utils/parseFolders";
import { getInstanceFileDefinitions } from "./getFileDefinitions";
import { getInstanceFiles } from "./getFiles";

interface GetDocumentsDto {
  instanceId: string;
  types?: string[];
}

type GetDocumentsReturn = {
  files: File[];
  fileTypes: FileType[];
  folders: Folder[];
};

async function getDocuments({
  instanceId,
  types,
}: GetDocumentsDto): Promise<GetDocumentsReturn> {
  const fileDefinitions = await getInstanceFileDefinitions(instanceId);

  if (!fileDefinitions || (fileDefinitions as any)._id === false) {
    return {
      files: [],
      fileTypes: [],
      folders: [],
    };
  }

  const fileTypes = parseFileTypes(fileDefinitions.types);
  const folders = parseFolders(fileDefinitions.folders, fileTypes);
  const files = await getInstanceFiles({ instanceId, types }, fileTypes);

  return {
    files,
    fileTypes,
    folders,
  };
}

export { getDocuments };
