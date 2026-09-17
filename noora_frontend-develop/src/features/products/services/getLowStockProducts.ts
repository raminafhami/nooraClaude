import apiClient from "@/api/client";
import { ApiPageResult } from "@/api/models/ApiResponse";

type GetLowStockProductsDto = {
	page: number;
	pageSize: number;
};

async function getLowStockProducts({
	page,
	pageSize,
}: GetLowStockProductsDto): Promise<ApiPageResult<any>> {
	const response = await apiClient.get<ApiPageResult<any>>({
		url: "products/low-stock",
		searchParams: {
			page,
			size: pageSize,
		},
	});

	return response.result;
}
export { getLowStockProducts };
