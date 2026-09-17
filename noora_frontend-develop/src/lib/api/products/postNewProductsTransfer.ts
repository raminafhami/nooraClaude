import apiClient from "../client";

interface PostNewProductsTransferProps {
	id: string;
	branchId: string;
	qty: number;
	description?: string;
}

export default async function PostNewProductsTransfer({
	id,
	branchId,
	qty,
	description,
}: PostNewProductsTransferProps) {
	let response;
	let link = `products/${id}/transfer/batch`;

	response = await apiClient.post({
		url: link,
		body: {
			branchId,
			qty,
			description: description?.trim() || undefined,
		},
	});

	return response;
}
