import apiClient from "@/api/client";
import { ObjectType } from "@/utils/object/ObjectType";

import { TaskSubmitType } from "../enums/TaskSubmitType";

type SubmitTaskDto = {
	instanceId: string;
	taskId: string;
	taskKey: string;
	status: TaskSubmitType;
	data: ObjectType;
	reason?: string;
	description?: string;
};

async function submitTask({
	instanceId,
	taskId,
	taskKey,
	status,
	data,
	reason,
	description,
}: SubmitTaskDto): Promise<boolean> {
	// verify description when instance is going to become on-hold or canceled
	if (
		(status === TaskSubmitType.Hold || status === TaskSubmitType.Cancel) &&
		!reason
	) {
		throw new Error(
			"reason must be provided when changing task status to on-hold or canceled",
		);
	}

	await apiClient.post({
		url: `/tasks/${instanceId}/complete`,
		body: {
			taskId,
			taskKey,
			status,
			parameters: data,
			reason,
			description,
		},
	});

	return true;
}

export { submitTask };
