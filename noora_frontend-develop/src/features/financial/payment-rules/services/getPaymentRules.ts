import apiClient from "@/api/client";
import { PagedResult, PagedResultApiModel } from "@/models/PagedResult";

import { PaymentRule, PaymentRuleApi } from "../models/PaymentRule";
import {
  PaymentRuleBaseQuery,
  PaymentRulePagedQuery,
  PaymentRuleQuery,
} from "../models/PaymentRuleQuery";
import { parsePaymentRule } from "../utils/parsePaymentRule";

export async function getPaymentRules(
  options?: Partial<PaymentRuleBaseQuery>,
): Promise<PaymentRule[]>;
export async function getPaymentRules(
  options?: Partial<PaymentRulePagedQuery>,
): Promise<PagedResult<PaymentRule>>;
export async function getPaymentRules(
  options: PaymentRuleQuery = {},
): Promise<PaymentRule[] | PagedResult<PaymentRule>> {
  let filters: any = {};
  let search: any = {};

  if (options.filters) {
    options.filters.forEach((filter) => {
      switch (filter.name) {
        default:
          if (!filter.type || filter.type === "match") {
            filters[filter.name] = filter.value;
          } else if (filter.type === "search") {
            search[filter.name] = filter.value;
          }
      }
    });
  }

  let pageNo: number;
  let pageSize: number;
  if (options.page) {
    if (typeof options.page === "number") {
      pageNo = options.page;
      pageSize = 10;
    } else {
      pageNo = options.page.no;
      pageSize = options.page.size;
    }
  } else {
    pageNo = 0;
    pageSize = Number.MAX_SAFE_INTEGER;
  }

  const response = await apiClient.get<PagedResultApiModel<PaymentRuleApi>>({
    url: `/payment-rule?page=${pageNo}&size=${pageSize}&filters=${
      Object.keys(filters).length !== 0 ? JSON.stringify(filters) : ""
    }&search=${
      Object.keys(search).length !== 0 ? JSON.stringify(search) : ""
    }&sort=${
      Object.keys(options.sort ?? {}).length !== 0
        ? JSON.stringify(options.sort)
        : ""
    }&populate=${options.populate?.join(",") || ""}`,
  });

  if (!options.page) {
    return parsePaymentRule(response.result.data);
  }

  return new PagedResult(
    parsePaymentRule(response.result.data),
    pageNo,
    pageSize,
    response.result.count,
  );
}
