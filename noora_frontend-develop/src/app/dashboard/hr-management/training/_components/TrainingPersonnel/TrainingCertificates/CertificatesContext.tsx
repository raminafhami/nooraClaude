"use client";

import { createContext } from "react";

import { Personnel } from "@/hrm/personnel/models/Personnel";
import { PersonnelExpertise } from "@/hrm/personnel/models/PersonnelExpertise";

interface CertificatesContextType {
  personnel: Personnel | null;
  certificates: PersonnelExpertise[];
  addCertificate: (personnelId: string, expertise: PersonnelExpertise) => void;
}

export const CertificatesContext = createContext<CertificatesContextType>(
  {} as CertificatesContextType,
);
