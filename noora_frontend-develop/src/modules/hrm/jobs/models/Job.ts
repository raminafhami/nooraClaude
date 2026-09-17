import { JobDepartment } from "./JobDepartment";
import { JobRequirements, JobRequireMentsApi } from "./JobRequirements";

export interface JobDescription {
  id: string;
  code: string;
  name: string;
  department: JobDepartment | null;
  supervisor: string;
  definition: string;
  duties: string[];
  authorities: string[];
  requirements: JobRequirements;
  metadata: {
    goodsInspectionField?: string;
  };
}

export interface JobDescriptionApi {
  id: string;
  code: string;
  name: string;
  department: JobDepartment | null;
  supervisor: string;
  definition: string;
  duties: string[];
  authorities: string[];
  requirements: JobRequireMentsApi;
  metadata: {
    goodsInspectionField?: string;
  };
}
