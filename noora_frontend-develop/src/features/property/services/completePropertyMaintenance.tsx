import apiClient from "@/api/client";

import { Property } from "../models/Property";

async function completePropertyMaintenance(
	id: string,
	maintenanceId: string,
): Promise<Property> {
	const response = await apiClient.post<Property>({
		url: `/property/${id}/maintenance/${maintenanceId}/complete`,
	});

	return response.result;
}

export { completePropertyMaintenance };
