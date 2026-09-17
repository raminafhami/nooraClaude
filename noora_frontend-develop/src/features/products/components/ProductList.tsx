"use client";

import { useCallback, useEffect, useState } from "react";
import { FaEye, FaPenToSquare } from "react-icons/fa6";

import GetAllProducts from "@/api/products/getAllProducts";
import AddNewProduct from "@/app/dashboard/storage/_module/products/modal/AddNewProduct";
import { useTableStore } from "@/cache/store/tableStore";
import { Button, buttonVariants } from "@/components/ui/button";
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

function ProductList({
	shouldRefetch,
	onChange,
}: {
	shouldRefetch?: boolean;
	onChange?: () => void;
}) {
	const [isModal, setIsModal] = useState<boolean>(false);
	const [isEdit, setIsEdit] = useState<string>();

	const { setTableData, getTableData } = useTableStore();

	const fetchData = useCallback(async (page: number, pageSize: number) => {
		let products = await GetAllProducts({
			page: page,
			size: pageSize,
		});

		return [products.result.data, products.result.count] as [Product[], number];
	}, []);

	const {
		isLoading,
		items: products,
		offset,
		page,
		pageSize,
		refetch,
		Pagination,
	} = usePagination<Product>(
		fetchData,
		getTableData("StorageTable")?.page,
		getTableData("StorageTable")?.size,
	);

	useEffect(() => {
		setTableData({
			tableName: "StorageTable",
			page: page,
			size: pageSize,
			data: products,
		});
	}, [page, pageSize, products, setTableData]);

	useEffect(() => {
		if (typeof shouldRefetch !== "undefined") {
			refetch();
		}
	}, [shouldRefetch, refetch]);

	return (
		<>
			{isModal && (
				<AddNewProduct
					isShow={isModal}
					setShow={setIsModal}
					getData={onChange ?? (() => {})}
					isEdit={isEdit}
				/>
			)}

			<Card>
				<CardHeader>
					<CardTitle>فهرست کالاها</CardTitle>
				</CardHeader>
				<CardContent className="px-0">
					<Table
						loading={isLoading}
						pagination={<Pagination />}
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
												{product.name || "-"}
											</DynamicLink>
										</TableCell>
										<TableCell>{product.category?.name || "-"}</TableCell>
										<TableCell>
											{product.stockQuantity || (
												<span className="text-red-600">اتمام موجودی</span>
											)}
										</TableCell>
										<TableCell>{product.alertThreshold || "نامشخص"}</TableCell>
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

													<TableAction>
														<Tooltip>
															<TooltipTrigger asChild>
																<Button
																	className="size-full"
																	size="icon"
																	type="button"
																	variant="link"
																	onClick={() => {
																		setIsModal(true);
																		setIsEdit(product.id);
																	}}
																>
																	<FaPenToSquare />
																</Button>
															</TooltipTrigger>
															<TooltipContent>ویرایش کالا</TooltipContent>
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
		</>
	);
}

export { ProductList };
