import { FileDefinitionFolderObject } from "../models/FileDefinition";
import { FileType } from "../models/FileType";
import { Folder } from "../models/Folder";

function parseFolders(
  folders: FileDefinitionFolderObject,
  fileTypes: FileType[]
): Folder[] {
  const result: Folder[] = [];

  Object.keys(folders).map((key) => {
    const { types, ...folder } = folders[key];

    result.push({
      name: key,
      types: types
        .map((x: string) => fileTypes.find((type) => type.name === x))
        .filter((x) => x) as FileType[],
      ...folder,
    });
  });

  return result;
}

export { parseFolders };
