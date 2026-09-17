"use client";

import { useCallback, useState } from "react";

import { Personnel } from "@/hrm/personnel/models/Personnel";

import { AttendancesForm } from "./AttendancesForm";
import { AttendancesTable } from "./AttendancesTable";

export interface AttendancesQuery {
  personnel: Personnel[] | null;
  dateFrom: string | null;
  dateTo: string | null;
  type: "personalReport" | "aggregateReport";
}

export function Reports(): React.ReactNode {
  const [query, setQuery] = useState<AttendancesQuery>({} as AttendancesQuery);

  const handleQuerySubmit = useCallback((query: AttendancesQuery) => {
    setQuery({ ...query });
  }, []);

  return (
    <>
      <div className="flex flex-col gap-y-5">
        <div className="grid grid-cols-5 xl:grid-cols-6 gap-x-6 items-start">
          <div className="col-span-4 xl:col-span-2">
            <AttendancesForm onQuerySubmit={handleQuerySubmit} />
          </div>
          <div className="col-span-full xl:col-span-4 gap-y-2 mt-10 xl:mt-0 flex flex-col">
            <AttendancesTable query={query} />
          </div>
        </div>
      </div>
    </>
  );
}
