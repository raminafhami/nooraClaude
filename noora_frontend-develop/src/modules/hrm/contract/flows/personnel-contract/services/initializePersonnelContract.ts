import { createInstance } from "@/felo/instances/services/createInstance";
import { getInstances } from "@/felo/instances/services/getInstances";
import { setStageOfInstance } from "@/felo/instances/services/setStageOfInstance";
import getProcessByKey from "@/felo/processes/services/getProcessByKey";
import { Contract } from "@/hrm/contract/models/Contract";
import getUserById from "@/identity/users/services/getUserById";

/**
 * Starts the personnel contract process for a contract. A contract that
 * already has an active process gets no second one (returns false).
 */
async function initializePersonnelContract(
	contract: Contract,
): Promise<boolean> {
	const running = await getInstances({
		filters: [
			{ name: "processDefinitionKey", value: "PersonnelContract" },
			{ name: "parameters.ContractId", value: contract.id },
			{ name: "status", value: "active" },
		],
	});

	if (running.length) {
		return false;
	}

	const user = await getUserById(contract.userId);

	const processDefinition = await getProcessByKey("PersonnelContract");

	if (!processDefinition) {
		throw new Error("فرایند قرارداد پرسنلی تعریف نشده است.");
	}

	const createdInstance = await createInstance({
		processId: processDefinition.id,
		parameters: {
			Assignees: {
				personnel: {
					id: user.id,
					name: user.fullname,
				},
			},
			ContractId: contract.id,
		},
	});

	await setStageOfInstance(createdInstance.id, "review-by-qa");

	return true;
}

export { initializePersonnelContract };
