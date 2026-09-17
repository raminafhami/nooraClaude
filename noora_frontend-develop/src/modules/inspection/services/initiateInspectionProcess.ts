import { Instance } from "@/felo/instances/models/Instance";
import { createInstance } from "@/felo/instances/services/createInstance";
import getProcessByKey from "@/felo/processes/services/getProcessByKey";

import { InspectionMethod } from "../models/InspectionMethod";

interface InspectionProcessInitiate {
	InspectionCaseNo: string;
	InspectionInstanceId: string;
	InspectionType: string;
	InspectionExpert: string;
	InspectionExpertName: string;
	BuyerName: string;
	DescriptionOfGoods: string[];
	FieldOfGoods: string;
	ProformaNo: string;
	ProformaDate: string;
	DischargerName: string;
	DischargerPhoneNo: string;
	CustomName: string | null;
	InspectionMethod: InspectionMethod | null;
}

export async function initiateInspectionProcess(
	props: InspectionProcessInitiate,
): Promise<Instance> {
	const process = await getProcessByKey("Inspectors");

	if (process === null) {
		throw new Error("Process not found.");
	}

	const createdInstance = await createInstance({
		processId: process.id,
		parameters: {
			...props,
		},
	});

	return createdInstance;
}
