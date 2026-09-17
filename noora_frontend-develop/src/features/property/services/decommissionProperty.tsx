import apiClient from "@/api/client";

import { Property } from "../models/Property";

type DecommissionPropertyDto = {
	date: string;
	reason: string;
	method: string;
	scrapValue: number;
};

async function decommissionProperty(
	id: string,
	details: DecommissionPropertyDto,
): Promise<Property> {
	const data = {
		date: details.date,
		reason: details.reason,
		method: details.method,
		scrapValue: details.scrapValue,
	};

	const response = await apiClient.post<Property>({
		url: `/property/${id}/decommission`,
		body: data,
	});

	return response.result;
}

export { decommissionProperty };
