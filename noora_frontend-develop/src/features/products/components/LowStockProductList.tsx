"use client";

import { useCallback, useEffect } from "react";
import { FaEye } from "react-icons/fa6";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DynamicLink } from "@/components/ui/dynamic-link";
import { usePagination } from "@/components/ui/pagination/usePagination";
import {
	Table,
	TableAction,
	TableActions,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { Product } from "../models/Product";
import { getLowStockProducts } from "../services/getLowStockProducts";

function LowStockProductList({ shouldRefetch }: { shouldRefetch?: boolean }) {
	const queryFn = useCallback(async (page: number, pageSize: number) => {
		const result = await getLowStockProducts({ page, pageSize });
		return [result.data, result.count] as [Product[], number];
	}, []);

	const {
		items: products,
		isLoading,
		offset,
		totalCount,
		refetch,
		Pagination,
	} = usePagination(queryFn, undefined, 5);

	useEffect(() => {
		if (typeof shouldRefetch !== "undefined") {
			refetch();
		}
	}, [shouldRefetch, refetch]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>فهرست کالاهای با موجودی محدود</CardTitle>
			</CardHeader>
			<CardContent className="px-0">
				<Table
					loading={isLoading}
					pagination={totalCount > 5 && <Pagination setSize={null} />}
					slotProps={{
						root: { className: "border-x-0 rounded-none" },
					}}
				>
					<TableHeader>
						<TableRow>
							<TableHead className="w-20">#</TableHead>
							<TableHead>نام</TableHead>
							<TableHead className="w-72">دسته بندی</TableHead>
							<TableHead className="w-64">موجودی</TableHead>
							<TableHead className="w-64">میزان هشدار</TableHead>
							<TableHead className="w-36">عملیات</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{products?.length ? (
							products.map((product, index) => (
								<TableRow key={index}>
									<TableCell>{offset + index + 1}</TableCell>
									<TableCell>
										<DynamicLink
											href={`/dashboard/storage/products/${product.id}`}
										>
											{product.name}
										</DynamicLink>
									</TableCell>
									<TableCell>{product.category?.name}</TableCell>
									<TableCell>
										{product.stockQuantity || (
											<span className="text-red-600">اتمام موجودی</span>
										)}
									</TableCell>
									<TableCell>{product.alertThreshold}</TableCell>
									<TableCell>
										<TableActions>
											<TooltipProvider>
												<TableAction>
													<Tooltip>
														<TooltipTrigger asChild>
															<DynamicLink
																className={cn(
																	buttonVariants({
																		size: "icon",
																		variant: "link",
																	}),
																)}
																href={`/dashboard/storage/products/${product.id}`}
															>
																<FaEye />
															</DynamicLink>
														</TooltipTrigger>
														<TooltipContent>مشاهده کالا</TooltipContent>
													</Tooltip>
												</TableAction>
											</TooltipProvider>
										</TableActions>
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={100}>هیچ موردی یافت نشد.</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}

export { LowStockProductList };
