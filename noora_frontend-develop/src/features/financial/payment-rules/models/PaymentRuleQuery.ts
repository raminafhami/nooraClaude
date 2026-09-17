import { PaymentRuleApi } from "./PaymentRule";

export interface PaymentRuleBaseQuery {
  filters: PaymentRuleQueryFilter[];
  sort?: Partial<PaymentRuleQuerySort>;
  populate?: PaymentRuleQueryPoplulateParam[];
}

export interface PaymentRulePagedQuery extends PaymentRuleBaseQuery {
  page: number | { no: number; size: number };
}

export type PaymentRuleQuery = Partial<PaymentRulePagedQuery>;

export interface PaymentRuleQueryFilter {
  name: PaymentRuleQueryFilterParam;
  value: any;
  type?: "match" | "search";
}

export type PaymentRuleQueryFilterParam = keyof PaymentRuleDb | (string & {});

export type PaymentRuleQuerySort = {
  [key in PaymentRuleQuerySortParam]: "asc" | "desc";
};

export type PaymentRuleQuerySortParam =
  | "name"
  | "type"
  | "method"
  | "amount"
  | "status";

export type PaymentRuleQueryPoplulateParam = "buyer";

export interface PaymentRuleDb extends Omit<PaymentRuleApi, "id"> {
  _id: string;
}
