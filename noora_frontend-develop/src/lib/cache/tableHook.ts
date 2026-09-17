import { useEffect, useState } from "react";

import { useTableStore } from "./store/tableStore";

interface SearchAttributeProps {
  [key: string]: any;
}

interface TableDataProps {
  tableName: string;
  data?: any;
  initialPage?: number;
  initialSize?: number;
  initialFilters?: SearchAttributeProps;
}

export function useTableData({
  tableName,
  initialPage = 0,
  initialSize = 10,
  initialFilters = undefined,
  data = undefined,
}: TableDataProps) {
  const { setTableData, getTableData } = useTableStore();

  const cachedData = getTableData(tableName);

  const [currentPage, setCurrentPage] = useState<number>(
    cachedData?.page ?? initialPage,
  );
  const [size, setSize] = useState<number>(cachedData?.size ?? initialSize);
  const [searchAttribute, setSearchAttribute] = useState<
    SearchAttributeProps | undefined
  >(cachedData?.filters ?? initialFilters);

  useEffect(() => {
    if (
      JSON.stringify(cachedData?.filters) !== JSON.stringify(searchAttribute)
    ) {
      setCurrentPage(0);
    }
  }, [cachedData?.filters, searchAttribute]);

  useEffect(() => {
    setTableData({
      tableName,
      page: currentPage,
      size,
      // data, // disabled for cached size
      filters: searchAttribute,
    });
  }, [currentPage, data, searchAttribute, setTableData, size, tableName]);

  return {
    currentPage,
    setCurrentPage,
    size,
    setSize,
    searchAttribute,
    setSearchAttribute,
  };
}
