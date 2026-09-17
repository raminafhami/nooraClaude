import apiClient from "@/api/client";
import { getInstanceById } from "@/felo/instances/services/getInstanceById";
import { CaseType } from "@/inspection/models/CaseType";

async function changeInspectionCaseType(
	instanceId: string,
	caseType: CaseType,
): Promise<void> {
	const instance = await getInstanceById(instanceId, ["CaseType"]);
	const currentCaseType: CaseType | null | undefined =
		instance.parameters["CaseType"];

	if (!currentCaseType) {
		throw new Error("case type is not found.");
	}

	if (currentCaseType === caseType) {
		throw new Error(`case type is already set as ${caseType}`);
	}

	await apiClient.patch({
		url: "income/change-case-type",
		body: {
			instanceId,
			caseType,
		},
	});
}

export { changeInspectionCaseType };
