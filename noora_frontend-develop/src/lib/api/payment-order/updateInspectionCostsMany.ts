import apiClient from "../client";

interface UpdateInspectionCostsManyProps {
  inspectionCostIds: string[];
  currency: string;
  currencyRate: number;
}

export default async function updateInspectionCostsMany({
  inspectionCostIds,
  currency,
  currencyRate,
}: UpdateInspectionCostsManyProps) {
  let response;
  let link = `inspection-costs/case/update-costs-many`;

  response = await apiClient.patch({
    url: link,
    body: {
      currency,
      currencyRate,
      inspectionCostIds,
    },
  });

  return response;
}
