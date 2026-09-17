export interface IFileData {
  directory: string;
  filename: string;
  mimetype: string;
  path: string;
  processInstanceId: string;
  fieldNames: string[];
  owner: string;
  access?: any;
}
