import { useCallback } from "react";
import { FaFolderTree } from "react-icons/fa6";

import {
	Card,
	CardContent,
	CardHeader,
	CardIcon,
	CardTitle,
} from "@/components/ui/card";
import { usePagination } from "@/components/ui/pagination/usePagination";
import { Instance } from "@/felo/instances/models/Instance";
import { getInstances } from "@/felo/instances/services/getInstances";

import { useBuyerContext } from "../useBuyerContext";
import { BuyerRequestsTable } from "./BuyerRequestsTable";

function BuyerRequestsWidget() {
	const { buyer } = useBuyerContext();

	const queryFn = useCallback(
		async (page: number, pageSize: number) => {
			const instances = await getInstances({
				filters: [
					{
						name: "$or",
						value: [
							{
								"parameters.Buyer.id": buyer.id,
							},
						],
					},
				],
				props: ["InspectionMethod", "InvoicePaymentStatus"],
				page: { no: page, size: pageSize },
				sort: { updatedAt: "desc" },
			});

			return [instances.items, instances.total] as [Instance[], number];
		},
		[buyer.id],
	);

	const { items, isLoading, offset, Pagination } = usePagination(
		queryFn,
		undefined,
		5,
	);

	return (
		<div className="col-span-full col-start-1 xl:col-span-8">
			<Card>
				<CardHeader>
					<CardTitle>
						<CardIcon>
							<FaFolderTree />
						</CardIcon>
						درخواست ها
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3 px-0">
					<BuyerRequestsTable
						items={items}
						loading={isLoading}
						offset={offset}
						pagination={<Pagination />}
					/>
				</CardContent>
			</Card>
		</div>
	);
}

export { BuyerRequestsWidget };
