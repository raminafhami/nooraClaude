import { createInstance } from "@/felo/instances/services/createInstance";
import { setStageOfInstance } from "@/felo/instances/services/setStageOfInstance";
import getProcessByKey from "@/felo/processes/services/getProcessByKey";
import { Contract } from "@/hrm/contract/models/Contract";
import getUserById from "@/identity/users/services/getUserById";

async function initializePersonnelContract(contract: Contract) {
	const user = await getUserById(contract.userId);

	const processDefinition = await getProcessByKey("PersonnelContract");

	if (processDefinition) {
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
	}
}

export { initializePersonnelContract };
