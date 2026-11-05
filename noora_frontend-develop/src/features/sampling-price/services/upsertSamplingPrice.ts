import apiClient from "@/api/client";

import { SamplingPrice } from "../models/SamplingPrice";

type CreateSamplingPriceDto = {
	title: string;
	processKeys: string[];
	price: number;
	effectiveFrom: string;
	note?: string;
};

type UpdateSamplingPriceDto = {
	title?: string;
	processKeys?: string[];
	deprecatedFrom?: string | null;
};

type AddSamplingPriceVersionDto = {
	price: number;
	effectiveFrom: string;
	note?: string;
};

async function createSamplingPrice(
	details: CreateSamplingPriceDto,
): Promise<SamplingPrice> {
	const response = await apiClient.post<SamplingPrice>({
		url: "sampling-price",
		body: details,
	});

	return response.result;
}

async function updateSamplingPrice(
	id: string,
	details: UpdateSamplingPriceDto,
): Promise<SamplingPrice> {
	const response = await apiClient.patch<SamplingPrice>({
		url: `sampling-price/${id}`,
		body: details,
	});

	return response.result;
}

async function addSamplingPriceVersion(
	id: string,
	details: AddSamplingPriceVersionDto,
): Promise<SamplingPrice> {
	const response = await apiClient.post<SamplingPrice>({
		url: `sampling-price/${id}/prices`,
		body: details,
	});

	return response.result;
}

async function removeSamplingPriceVersion(
	id: string,
	priceId: string,
): Promise<SamplingPrice> {
	const response = await apiClient.delete<SamplingPrice>({
		url: `sampling-price/${id}/prices/${priceId}`,
	});

	return response.result;
}

export {
	addSamplingPriceVersion,
	createSamplingPrice,
	removeSamplingPriceVersion,
	updateSamplingPrice,
};
