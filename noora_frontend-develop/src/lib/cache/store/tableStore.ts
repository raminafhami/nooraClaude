import { create } from "zustand";

interface TableData {
  tableName: string;
  page: number;
  size: number;
  filters?: Record<string, any>;
  data?: any[];
}

interface TableState {
  tableData: Record<string, TableData>;
  setTableData: (tableData: TableData) => void;
  getTableData: (tableName: string) => TableData | undefined;
}

export const useTableStore = create<TableState>((set, get) => ({
  tableData: {},

  setTableData: (tableData: TableData) =>
    set((state) => ({
      tableData: {
        ...state.tableData,
        [tableData.tableName]: tableData,
      },
    })),

  getTableData: (tableName: string) => {
    const state = get();
    return state.tableData[tableName];
  },
}));
