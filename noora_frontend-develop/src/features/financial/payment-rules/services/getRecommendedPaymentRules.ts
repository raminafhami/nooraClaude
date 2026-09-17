import { CaseType } from "@/inspection/models/CaseType";
import { InspectionType } from "@/inspection/models/InspectionType";
import { GenericObject } from "@/ts/GenericObject";

import { PaymentRule } from "../models/PaymentRule";
import { PaymentRuleQueryFilter } from "../models/PaymentRuleQuery";
import { PaymentRuleStatus } from "../models/PaymentRuleStatus";
import { getPaymentRulesByUser } from "./getPaymentRulesByUser";

async function getRecommendedPaymentRules(
  userId: string,
  {
    service,
    buyerId,
    inspectionType,
    caseType,
    inspectionMethod,
    role,
  }: {
    service?: string;
    buyerId?: string;
    inspectionType?: InspectionType;
    caseType?: CaseType;
    inspectionMethod?: string;
    role?: string;
  },
): Promise<PaymentRule[]> {
  // get valid payment rules
  const caseConditionsFilters = [];

  if (inspectionType) {
    caseConditionsFilters.push({
      $or: [
        { inspectionType: { $exists: false } },
        { inspectionType: { $eq: null } },
        inspectionType && { inspectionType },
      ],
    });
  }

  if (caseType) {
    caseConditionsFilters.push({
      $or: [
        { caseType: { $exists: false } },
        { caseType: { $eq: null } },
        caseType && { caseType },
      ],
    });
  }

  if (inspectionMethod) {
    caseConditionsFilters.push({
      $or: [
        { inspectionMethod: { $exists: false } },
        { inspectionMethod: { $eq: null } },
        inspectionMethod && { inspectionMethod },
      ],
    });
  }

  if (role) {
    caseConditionsFilters.push({
      $or: [
        { role: { $exists: false } },
        { role: { $eq: null } },
        role && { role },
      ],
    });
  }

  const filters: PaymentRuleQueryFilter[] = [
    { name: "status", value: PaymentRuleStatus.Active },
    {
      name: "$and",
      value: [
        {
          $or: [
            { buyerId: { $exists: false } },
            { buyerId: { $eq: null } },
            buyerId && {
              buyerId,
            },
          ],
        },
        {
          $or: [
            { cases: { $exists: false } },
            { cases: { $eq: [] } },
            {
              cases: {
                $elemMatch: {
                  $and: caseConditionsFilters,
                },
              },
            },
          ],
        },
      ],
    },
  ];

  if (service) {
    filters.push({ name: "service", value: service });
  }

  const rules = await getPaymentRulesByUser(userId, {
    filters,
  });

  // expand and filter out rules with invalid cases
  const expandedRules = rules.flatMap((rule) => {
    const rules: PaymentRule[] = [];

    if (rule.cases?.length >= 1) {
      rule.cases.forEach((x) => {
        const caseItem: GenericObject = {};

        if (
          (rule.buyerId && buyerId !== rule.buyerId) ||
          (x.inspectionType && inspectionType !== x.inspectionType) ||
          (x.caseType && caseType !== x.caseType) ||
          (x.inspectionMethod && inspectionMethod !== x.inspectionMethod) ||
          (x.role && role !== x.role)
        ) {
          return;
        }

        rule.buyerId && (caseItem.buyerId = rule.buyerId);
        x.inspectionType && (caseItem.inspectionType = x.inspectionType);
        x.caseType && (caseItem.caseType = x.caseType);
        x.inspectionMethod && (caseItem.inspectionMethod = x.inspectionMethod);
        x.role && (caseItem.role = x.role);

        rules.push({
          ...rule,
          cases: [caseItem],
        });
      });
    } else {
      rules.push(rule);
    }

    return rules;
  });

  // sort rules desc by the number of specification parameters
  const sortedRules = expandedRules
    .map((obj) => ({
      obj,
      keyCount: obj.cases.length ? Object.keys(obj.cases[0]).length : 0,
    }))
    .sort((a, b) => b.keyCount - a.keyCount)
    .map(({ obj }) => obj);

  return sortedRules;
}

export { getRecommendedPaymentRules };
