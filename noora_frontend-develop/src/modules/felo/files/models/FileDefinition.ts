export interface FileDefinitions {
  types: FileDefinitionTypeObject;
  folders: FileDefinitionFolderObject;
}

export interface FileDefinitionFolderObject {
  [key: string]: FileDefinitionFolder;
}

export interface FileDefinitionFolder {
  title: string;
  types: string[];
}

export interface FileDefinitionTypeObject {
  [key: string]: FileDefinitionType;
}

export interface FileDefinitionType {
  title: string;
  extensions: string[];
  multiple: boolean;
}
