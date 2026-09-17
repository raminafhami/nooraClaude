import { FileDefinitionTypeObject } from "../models/FileDefinition";
import { FileType } from "../models/FileType";

function parseFileTypes(types: FileDefinitionTypeObject): FileType[] {
  const result: FileType[] = [];

  Object.keys(types).map((k) => {
    result.push({
      name: k,
      ...types[k],
    });
  });

  return result;
}

export { parseFileTypes };
