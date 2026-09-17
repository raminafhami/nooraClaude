import apiClient from "@/api/client";

import { Property } from "../models/Property";
import { PropertyDimensions } from "../models/PropertyDimensions";

type UpdatePropertyDto = {
	type: string;
	propertyNo: string;
	model?: string;
	manufacturer?: string;
	serialNumber: string;
	dimensions: PropertyDimensions;
	weight?: number;
	color?: string;
	purchaseDate: string;
	purchasePrice: number;
	currentValue?: number;
	depreciationRate?: number;
	location: {
		building: string;
		branchId: string;
		floor?: string;
		room?: string;
	};
	warrantyStart?: string;
	warrantyEnd?: string;
	insurancePolicyNumber?: string;
	insuranceCompany?: string;
};

type UpdatePropertyApi = UpdatePropertyDto & {};

async function updateProperty(
	id: string,
	details: UpdatePropertyDto,
): Promise<Property> {
	const data = {
		type: details.type,
		model: details.model || "",
		manufacturer: details.manufacturer || "",
		serialNumber: details.serialNumber,
		dimensions: details.dimensions || { length: 0, width: 0, height: 0 },
		weight: details.weight ?? 0,
		color: details.color || "",
		purchaseDate: details.purchaseDate,

		purchasePrice: details.purchasePrice ?? 0,
		currentValue: details.currentValue ?? 0,
		depreciationRate: details.depreciationRate ?? 0,
		location: details.location,
		warrantyStart: details.warrantyStart,
		warrantyEnd: details.warrantyEnd,
		insurancePolicyNumber: details.insurancePolicyNumber || "",
		insuranceCompany: details.insuranceCompany || "",
		movementHistory: [],
		assignedUsers: [],
		assignmentHistory: [],
		decommissionDetails: null,
		maintenanceHistory: [],
	};

	const response = await apiClient.patch<Property>({
		url: `property/${id}`,
		body: data,
	});

	return response.result;
}

export { updateProperty };
