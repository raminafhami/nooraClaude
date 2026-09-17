"use client";

import { AttendancesAggregateTable } from "./AttendancesAggregateTable";
import { AttendancesDetailedTable } from "./AttendancesDetailedTable";
import { AttendancesQuery } from "./Reports";

interface Props {
  query: AttendancesQuery;
}

export function AttendancesTable({ query }: Props): React.ReactNode {
  return query.dateFrom && query.dateTo && query.personnel ? (
    query.personnel.length === 1 ? (
      <AttendancesDetailedTable query={query} />
    ) : (
      <AttendancesAggregateTable query={query} />
    )
  ) : (
    <></>
  );
}
