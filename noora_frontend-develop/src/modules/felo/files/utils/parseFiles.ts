import { User } from "@/identity/users/models/User";

import { File, FileApi } from "../models/File";
import { FileType } from "../models/FileType";

export function parseFile(
  from: FileApi,
  fileTypes: FileType[],
  users: User[],
): File;
export function parseFile(
  from: FileApi[],
  fileTypes: FileType[],
  users: User[],
): File[];
export function parseFile(
  from: FileApi | FileApi[],
  fileTypes: FileType[],
  users: User[],
): File | File[] {
  if (Array.isArray(from)) {
    return from.map((x) => parseFile(x, fileTypes, users));
  }

  let result: File = {
    id: from.id,
    name: from.filename,
    types: from.fieldNames
      .map((x) => fileTypes.find((type) => type.name === x))
      .filter((x) => x) as FileType[],
    folder: from.folder,
    uploadById: typeof from.owner === "string" ? from.owner : from.owner.id,
    uploadBy: users.find((x) => x.id === from.owner)?.fullname || "",
    uploadAt: new Date(from.createdAt),
  };

  return result;
}
