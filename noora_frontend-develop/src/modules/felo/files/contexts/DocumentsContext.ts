import { createContext } from "react";

import { File } from "../models/File";
import { FileType } from "../models/FileType";
import { Folder } from "../models/Folder";

interface DocumentsContextType {
  instanceId: string;
  files: File[];
  folders: Folder[];
  fileTypes: FileType[];
}

const DocumentsContext = createContext<DocumentsContextType>(
  {} as DocumentsContextType
);

export { DocumentsContext };
