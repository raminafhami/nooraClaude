import apiClient from "../client";

interface PutNewProductsProps {
	name: string;
	categoryId: string;
	counter?: number;
	id: string;
	alertThreshold?: number;
}

export default async function PutNewProducts({
	name,
	categoryId,
	counter,
	id,
	alertThreshold,
}: PutNewProductsProps) {
	let response;
	let link = `products/${id}`;

	response = await apiClient.put({
		url: link,
		body: {
			name,
			categoryId,
			counter,
			alertThreshold: alertThreshold || null,
		},
	});

	return response;
}
