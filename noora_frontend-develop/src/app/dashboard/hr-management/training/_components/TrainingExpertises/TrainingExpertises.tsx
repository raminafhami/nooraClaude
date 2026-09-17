"use client";

import { useCallback, useState } from "react";

import { Expertise } from "@/hrm/expertises/models/Expertise";

import { ExpertisesWidget } from "./ExpertisesWidget/ExpertisesWidget";
import { PersonnelWidget } from "./PersonnelWidget";

export function TrainingExpertises(): React.ReactNode {
  const [selectedExpertises, setSelectedExpertises] = useState<Expertise[]>([]);

  const handleExpertisesSelect = useCallback((expertises: Expertise[]) => {
    setSelectedExpertises([...expertises]);
  }, []);

  return (
    <>
      <div className="flex flex-col space-y-4">
        <ExpertisesWidget onExpertisesSelect={handleExpertisesSelect} />
        <PersonnelWidget expertises={selectedExpertises} />
      </div>
    </>
  );
}
