"use client";

import { createContext } from "react";

import { Personnel } from "@/hrm/personnel/models/Personnel";
import { PersonnelExpertise } from "@/hrm/personnel/models/PersonnelExpertise";

interface CertificatesContextType {
  personnel: Personnel | null;
  // the training item the dialog was opened for
  item: PersonnelExpertise | null;
  certificates: PersonnelExpertise[];
  addCertificate: (personnelId: string, expertise: PersonnelExpertise) => void;
  removeCertificate: (expertiseId: string) => void;
}

export const CertificatesContext = createContext<CertificatesContextType>(
  {} as CertificatesContextType,
);
