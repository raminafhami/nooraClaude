import React from "react";
import { dateQuery } from "./EntriesHistoryWidget";
import { EntriesHistoryGeneralTable } from "./EntriesHistoryGeneralTable";
import EntriesHistoryDetailedTable from "./EntriesHistoryDetailedTable";
import WorkshiftsReportTable from "./WorkshiftsReportTable";

function EntriesHistoryTable({ query }: { query: dateQuery }) {
  return query.type === "detailed" ? (
    <EntriesHistoryDetailedTable query={query} />
  ) : query.type === "general" ? (
    <EntriesHistoryGeneralTable query={query} />
  ) : query.type === "workshift" ? (
    <WorkshiftsReportTable query={query} />
  ) : (
    <></>
  );
}

export default EntriesHistoryTable;
