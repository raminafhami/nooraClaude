"use client";

import { useCallback, useState } from "react";

import { Workshift } from "@/hrm/attendance/models/Workshift";

import { WorkshiftAddForm } from "./WorkshiftAddForm";
import { WorkshiftsTable } from "./WorkshiftsTable";

export function Workshifts(): React.ReactNode {
  const [workshifts, setWorkshifts] = useState<Workshift[]>([]);

  const handleWorkshiftsFetch = useCallback((workshifts: Workshift[]): void => {
    setWorkshifts(workshifts);
  }, []);

  const handleWorkshiftAdd = useCallback((workshift: Workshift): void => {
    setWorkshifts((workshifts) => [workshift, ...workshifts]);
  }, []);

  return (
    <div className="xl:grid xl:grid-cols-3 gap-x-5">
      <WorkshiftAddForm onWorkshiftAdd={handleWorkshiftAdd} />
      <WorkshiftsTable
        workshifts={workshifts}
        onWorkshiftsFetch={handleWorkshiftsFetch}
      />
    </div>
  );
}
