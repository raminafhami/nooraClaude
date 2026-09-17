import { FileType } from "./FileType";

export interface File {
  id: string;
  name: string;
  types: FileType[];
  folder: string;
  uploadById: string;
  uploadBy: string;
  uploadAt: Date;
}

export interface FileApi {
  id: string;
  filename: string;
  fieldNames: string[];
  folder: string;
  owner: string | { id: string; name: string; lastname: string };
  createdAt: string;
}
