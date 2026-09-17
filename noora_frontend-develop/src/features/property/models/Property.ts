import { UserApi } from "@/identity/users/models/User";

import { PropertyStatus } from "../enums/PropertyStatus";
import { PropertyDimensions } from "./PropertyDimensions";
import { PropertyLocation } from "./PropertyLocation";

type Property = {
	id: string;
	files: {
		title: string;
		id: string;
	}[];
	type: string;
	category: string;
	model?: string;
	manufacturer: string;
	serialNumber: string;
	dimensions: PropertyDimensions;
	weight: number;
	color: string;
	purchaseDate: string;
	purchasePrice: number;
	currentValue: number;
	depreciationRate: number;
	location: PropertyLocation;
	movementHistory: {
		date: string;
		from: PropertyLocation | null;
		to: PropertyLocation;
	}[];
	warrantyStart: string;
	warrantyEnd: string;
	insurancePolicyNumber: string;
	insuranceCompany: string;
	assignedUser: string | null;
	assignedUsers: string[];
	assignmentHistory: {
		date: string;
		userId: UserApi | string;
		action: string;
	}[];
	status: PropertyStatus;
	propertyNo: string;
	repairHistory:
		| {
				description: string;
				date: string;
				cost: number;
				type: string;
		  }[]
		| null;
	decommissionDetails: {
		date: string;
		reason: string;
		method: string;
		scrapValue: number;
	} | null;
	maintenanceHistory:
		| {
				technician: string;
				description: string;
				date: string;
				cost: number;
				startDate: string;
				endDate: string;
				id: string;
		  }[]
		| null;
	supplierName: string;
	technicalSpecifications: string;
	calibrationDate: string;
	nextCalibrationDate: string;
};

export type { Property };
