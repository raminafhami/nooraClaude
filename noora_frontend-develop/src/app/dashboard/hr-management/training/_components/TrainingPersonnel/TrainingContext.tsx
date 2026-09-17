"use client";

import { createContext } from "react";

import { Personnel } from "@/hrm/personnel/models/Personnel";
import { PersonnelExpertise } from "@/hrm/personnelExpertise/models/PersonnelExpertise";
import { PersonnelExpertise as PersonExpertise } from "@/hrm/personnel/models/PersonnelExpertise";

interface TrainingContextType {
  personnel: Personnel[];
  addExpertise: (personnelId: string, expertise: PersonExpertise) => void;
  updateExpertise: (personnelId: string, expertise: PersonnelExpertise) => void;
}

export const TrainingContext = createContext<TrainingContextType>(
  {} as TrainingContextType
);
