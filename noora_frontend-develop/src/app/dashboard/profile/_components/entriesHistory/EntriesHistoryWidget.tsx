import React, { useCallback, useState } from "react";

import { EntriesHistoryForm } from "./EntriesHistoryForm";
import EntriesHistoryTable from "./EntriesHistoryTable";

export interface dateQuery {
  type: string;
  dateFrom: string;
  dateTo: string;
  date: string;
}

function EntriesHistoryWidget() {
  const [query, setQuery] = useState<dateQuery>({} as dateQuery);

  const handleQuerySubmit = useCallback((query: dateQuery) => {
    setQuery({ ...query });
  }, []);

  return (
    <div className="xl:grid xl:grid-cols-3 gap-x-10">
      <EntriesHistoryForm onQuerySubmit={handleQuerySubmit} />
      <EntriesHistoryTable query={query} />
    </div>
  );
}

export default EntriesHistoryWidget;
