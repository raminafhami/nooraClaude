import apiClient from "@/api/client";

import { CostCaseStatus } from "../enums/CostCaseStatus";

interface CostsUpdateByCaseModel {
	instanceId: string;
	status: Exclude<CostCaseStatus, CostCaseStatus.Unpaid>;
}

async function updateCostsByCase(
	details: CostsUpdateByCaseModel,
): Promise<void> {
	const response = await apiClient.patch({
		url: `/inspection-costs/case/${details.instanceId}`,
		body: {
			caseStatus: details.status,
		},
	});
}

export { updateCostsByCase };
