import moment from "moment";

import apiClient from "@/api/client";

import { Property } from "../models/Property";

type maintenancePropertyDto = {
	date: string;
	technician: string;
	description: string;
	cost: number;
};

async function maintenanceProperty(
	id: string,
	details: maintenancePropertyDto,
): Promise<Property> {
	const data = {
		date: moment(details.date, "YYYY/MM/DD").locale("fa").format("YYYY-MM-DD"),
		technician: details.technician,
		description: details.description,
		cost: details.cost,
	};

	const response = await apiClient.post<Property>({
		url: `/property/${id}/maintenance`,
		body: data,
	});

	return response.result;
}

export { maintenanceProperty };
