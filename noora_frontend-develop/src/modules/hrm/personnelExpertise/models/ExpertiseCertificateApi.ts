
export interface ExpertiseCertificateApi {
  expertiseId: string;
  userId: string;
  status: "qualified" | "learning" | "unqualified" | null | undefined;
  organizationName: string;
  file: File | undefined;
  certificateDate: string;
  [key: string]: any;
}
