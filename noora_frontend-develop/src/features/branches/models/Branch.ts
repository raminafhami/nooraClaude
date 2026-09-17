import { Personnel } from "@/hrm/personnel/models/Personnel";

export interface Branch {
  id: string;
  name: string;
  title: string;
  managerId: string | null;
  manager: Personnel | null;
}

export interface BranchApi {
  id: string;
  name: string;
  title: string;
  metadata: {
    managerId: string | null;
  };
}

export interface BranchDb extends Omit<BranchApi, "id"> {
  _id: string;
}
