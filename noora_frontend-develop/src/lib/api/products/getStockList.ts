import apiClient from "../client";

interface GetStockListProps {
	page: number;
	size: number;
}

async function GetStockList({ page, size }: GetStockListProps) {
	let response;
	let link = `products/low-stock?page=${page}&size=${size}`;

	response = await apiClient.get({
		url: link,
	});

	return response;
}
export { GetStockList };
