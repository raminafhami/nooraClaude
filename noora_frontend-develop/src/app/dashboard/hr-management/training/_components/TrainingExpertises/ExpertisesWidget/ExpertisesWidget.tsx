"use client";

import { memo, useCallback, useMemo, useState } from "react";

import { Expertise } from "@/hrm/expertises/models/Expertise";

import { ExpertisesSelected } from "./ExpertisesSelected";
import { ExpertisesUnselected } from "./ExpertisesUnselected";

interface Props {
  onExpertisesSelect: (expertise: Expertise[]) => void;
}

export const ExpertisesWidget = memo(function ExpertisesWidget({
  onExpertisesSelect,
}: Props): React.ReactNode {
  const [expertises, setExpertises] = useState<Expertise[]>([]);
  const [selectedExpertises, setSelectedExpertises] = useState<Expertise[]>([]);

  const handleExpertiseSelect = useCallback((expertise: Expertise) => {
    setSelectedExpertises((previous) => [...previous, { ...expertise }]);
  }, []);

  const handleExpertiseRemove = useCallback((expertiseId: string) => {
    setSelectedExpertises((previous) => [
      ...previous.filter((x) => x.id !== expertiseId),
    ]);
  }, []);

  const unselectedExpertises = useMemo(() => {
    return expertises.filter(
      (x) => !selectedExpertises.find((y) => y.id === x.id)
    );
  }, [selectedExpertises, expertises]);

  return (
    <>
      <div>
        <div className="overflow-hidden flex flex-col md:flex-row xl:h-80 gap-x-4 gap-y-4 w-full">
          <ExpertisesUnselected
            expertises={unselectedExpertises}
            onExpertiseSelect={handleExpertiseSelect}
            onExpertisesLoad={setExpertises}
          />

          <ExpertisesSelected
            expertises={selectedExpertises}
            onExpertiseRemove={handleExpertiseRemove}
            onExpertisesSelect={onExpertisesSelect}
          />
        </div>
      </div>
    </>
  );
});
