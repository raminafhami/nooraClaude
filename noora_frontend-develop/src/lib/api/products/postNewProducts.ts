import apiClient from "../client";

interface PostNewProductsProps {
	name: string;
	categoryId: string;
	endIndex: number;
	startIndex: number;
	alertThreshold?: number;
}

export default async function PostNewProducts({
	name,
	categoryId,
	endIndex,
	startIndex,
	alertThreshold,
}: PostNewProductsProps) {
	let response;
	let link = `products/`;

	response = await apiClient.post({
		url: link,
		body: {
			name,
			categoryId,
			endIndex,
			startIndex,
			alertThreshold: alertThreshold || 0,
		},
	});

	return response;
}
