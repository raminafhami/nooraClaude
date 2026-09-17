import apiClient from "@/api/client";

import { Property } from "../models/Property";
import { PropertyDimensions } from "../models/PropertyDimensions";
import { PropertyLocation } from "../models/PropertyLocation";

type CreatePropertyDto = {
	type?: string;
	category: string;
	propertyNo?: string;
	model?: string;
	manufacturer?: string;
	serialNumber?: string;
	dimensions?: PropertyDimensions;
	weight?: number;
	color?: string;
	purchaseDate?: string;
	purchasePrice?: number;
	currentValue?: number;
	depreciationRate?: number;
	location?: PropertyLocation;
	warrantyStart?: string;
	warrantyEnd?: string;
	insurancePolicyNumber?: string;
	insuranceCompany?: string;
	calibrationDate?: string;
	nextCalibrationDate?: string;
	technicalSpecifications?: string;
	supplierName?: string;
};

type CreatePropertyApi = CreatePropertyDto;

async function createProperty(details: CreatePropertyDto): Promise<Property> {
	const data: CreatePropertyApi = {
		...details,
	};

	const response = await apiClient.post<Property>({
		url: "property",
		body: data,
	});

	return response.result;
}

export { createProperty };
