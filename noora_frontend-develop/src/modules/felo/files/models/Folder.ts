import { FileType } from "./FileType";

export interface Folder {
  name: string;
  title: string;
  types: FileType[];
}
