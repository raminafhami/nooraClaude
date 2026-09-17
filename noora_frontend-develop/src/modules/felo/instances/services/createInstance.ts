import apiClient from "@/api/client";
import { ObjectType } from "@/utils/object/ObjectType";

import { Instance } from "../models/Instance";
import { InstanceApi } from "../models/InstanceApi";
import { parseInstance } from "../utils/parseInstance";

interface CreateInstanceDto {
	processId: string;
	parameters?: ObjectType;
	cnId?: string;
	feasibilityProcessInstanceId?: string;
}

interface CreateInstanceApi {
	parameters: ObjectType;
	cnId?: string;
	feasibilityProcessInstanceId?: string;
}

export async function createInstance({
	processId,
	parameters = {},
	cnId,
	feasibilityProcessInstanceId,
}: CreateInstanceDto): Promise<Instance> {
	const data: CreateInstanceApi = {
		parameters,
		cnId,
		feasibilityProcessInstanceId,
	};

	const response = await apiClient.post<InstanceApi>({
		url: `/process-instances/run/${processId}`,
		body: data,
	});

	return parseInstance(response.result);
}
