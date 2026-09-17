import { Indicator } from "./Indicator";

interface IndicatorBaseQuery {
  filters?: Partial<IndicatorQueryFilter>;
  sort?: Partial<IndicatorQuerySort>;
}

interface IndicatorPagedQuery extends IndicatorBaseQuery {
  pagination: { page: number; pageSize: number };
}

type IndicatorQuery = Partial<IndicatorPagedQuery>;

type IndicatorQueryFilter = {
  [key in keyof Omit<Indicator, "id"> | "_id" | (string & {})]: any;
};

type IndicatorQuerySort = {
  [key in IndicatorQuerySortParam]: "asc" | "desc";
};

type IndicatorQuerySortParam = keyof Omit<Indicator, "id"> | (string & {});

export type {
  IndicatorBaseQuery,
  IndicatorPagedQuery,
  IndicatorQuery,
  IndicatorQueryFilter,
  IndicatorQuerySort,
  IndicatorQuerySortParam,
};
