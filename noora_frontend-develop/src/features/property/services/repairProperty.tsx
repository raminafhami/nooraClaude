import moment from "moment";

import apiClient from "@/api/client";

import { Property } from "../models/Property";

type repairPropertyDto = {
	date: string;
	cost: number;
	description: string;
	type: any;
};

async function repairProperty(
	id: string,
	details: repairPropertyDto,
): Promise<Property> {
	const data = {
		date: details.date,
		cost: details.cost,
		description: details.description,
		type: details.type,
	};

	const response = await apiClient.post<Property>({
		url: `/property/${id}/repairs`,
		body: data,
	});

	return response.result;
}

export { repairProperty };
