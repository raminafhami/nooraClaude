import { Cost } from "../models/Cost";
import { getCosts } from "./getCosts";

async function getCostsByCase(caseId: string): Promise<Cost[]> {
	return await getCosts({
		filters: { caseId },
		populate: ["categoryId", "ruleId", "personId"],
	});
}

export { getCostsByCase };
