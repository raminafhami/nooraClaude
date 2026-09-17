"use client";

import moment from "jalali-moment";
import { useEffect, useState } from "react";
import { FaCircleExclamation } from "react-icons/fa6";
import { toast } from "sonner";

import GetProductHistoryList from "@/api/products/getProductHistoryList";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Pagination from "@/components/ui/pagination/Pagination";
import { Table } from "@/ui/Table";

import ProductAction from "./modal/ProductAction";
import SummaryCard from "./SummaryCard";

interface ProductPageProps {
	product: any;
	loading: boolean;
	setSearch: (s: any) => any;
	getData: () => void;
	setLoading: (s: boolean) => any;
}

interface SearchAttributeProps {
	searchInstructor?: string;
	searchName?: string;
}

type Product = {
	name: string;
	id: string;
};

type Branch = {
	title: string;
	name: string;
	id: string;
};

type DataItem = {
	from: number;
	to: number;
	product: Product;
	branch: Branch;
	id: string;
	quantity: string;
	date: string;
	createdBy: {
		name: string;
		lastname: string;
	};
	description?: string;
};

type Result = {
	data: DataItem[];
	count: number;
};

export function ProductPage({
	product,
	loading,
	setSearch,
	getData,
	setLoading,
}: ProductPageProps) {
	const [searchAttribute, setSearchAttribute] =
		useState<SearchAttributeProps>();
	const [items, setItems] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(0);
	const [size, setSize] = useState<number>(15);
	const [actionModal, setActionModal] = useState<boolean>(false);
	const [history, setHistory] = useState<DataItem[]>();
	const [mode, setMode] = useState<"+" | "-" | undefined>();
	async function getProductHistory() {
		try {
			let res = await GetProductHistoryList({
				page: currentPage,
				size: size,
				productId: product?.id,
			});
			if (res) {
				setHistory(res.result.data);
				setItems(res.result.count);
			}
		} catch {
			toast.error("خطایی در دریافت اطلاعات رخ داد!");
		}
	}

	useEffect(() => {
		const delayDebounceFn = setTimeout(() => {
			if (searchAttribute) {
				setSearch(searchAttribute);
			}
		}, 300);

		return () => clearTimeout(delayDebounceFn);
	}, [searchAttribute]);

	useEffect(() => {
		if (product) {
			getProductHistory();
		}
	}, [product, currentPage, size]);

	return (
		<>
			<div className="space-y-10">
				{product && (
					<div className="flex flex-wrap justify-center">
						<SummaryCard
							className="mb-[2rem"
							title="نام"
							subTitle={product.name}
							fontSize={0.9}
						/>
						<SummaryCard
							className="mb-[2rem"
							title="دسته بندی"
							subTitle={product?.category?.name ?? "-"}
							fontSize={0.9}
						/>
						<SummaryCard
							className="mb-[2rem"
							title={"موجودی"}
							subTitle={product?.stockQuantity?.toLocaleString() ?? "-"}
							fontSize={0.9}
						/>
						<SummaryCard
							className="mb-[2rem"
							title="آخرین خروج"
							subTitle={
								(history &&
									history[history?.length - 1]?.to?.toLocaleString()) ??
								"-"
							}
							fontSize={0.9}
						/>
					</div>
				)}

				<div>
					<div className="flex flex-col gap-x-8 gap-y-4 sm:flex-row sm:items-center">
						<h1 className="text-lg">ورود</h1>
						{product &&
							typeof product.stockQuantity === "number" &&
							typeof product.alertThreshold === "number" &&
							product.stockQuantity < product.alertThreshold && (
								<Alert variant="warn">
									<FaCircleExclamation />
									<AlertDescription>
										موجودی انبار به کمتر از میزان هشدار مشخص شده رسیده است.
									</AlertDescription>
								</Alert>
							)}
					</div>

					<Table.Root className="py-[2rem]">
						<Table.Head>
							<Table.Row className="select-none bg-gray-100 text-right">
								<Table.Cell as="th">ردیف</Table.Cell>
								<Table.Cell as="th">از شماره</Table.Cell>
								<Table.Cell as="th">تا شماره</Table.Cell>
								<Table.Cell as="th">مقدار باقی مانده</Table.Cell>
								<Table.Cell as="th">قابل استفاده از</Table.Cell>
								<Table.Cell as="th" className="float-left">
									<Button
										onClick={() => {
											setActionModal(true);
											setMode("+");
										}}
									>
										عملیات
									</Button>
								</Table.Cell>
							</Table.Row>
						</Table.Head>
						<Table.Body>
							{product?.stock?.length ? (
								product?.stock.map((pr: any, index: number) => (
									<Table.Row key={pr.id}>
										<Table.Cell>{index + 1}</Table.Cell>
										<Table.Cell>
											<span className="rounded-lg bg-indigo-100 p-1 text-indigo-800">
												{pr?.startIndex?.toLocaleString() ?? "-"}
											</span>
										</Table.Cell>
										<Table.Cell>
											<span className="rounded-lg bg-indigo-100 p-1 text-indigo-800">
												{pr?.endIndex?.toLocaleString() ?? "-"}
											</span>
										</Table.Cell>
										<Table.Cell>
											<span>
												{pr?.quantity ? pr?.quantity?.toLocaleString() : "-"}
											</span>
										</Table.Cell>
										<Table.Cell>
											<span>
												{pr?.endIndex && pr?.quantity
													? (pr?.endIndex - pr?.quantity + 1)?.toLocaleString()
													: "-"}
											</span>
										</Table.Cell>

										<Table.Cell></Table.Cell>
									</Table.Row>
								))
							) : (
								<Table.Row>
									<Table.Cell>تاریخچه ای یافت نشد...</Table.Cell>
									<Table.Cell></Table.Cell>
									<Table.Cell></Table.Cell>
								</Table.Row>
							)}
						</Table.Body>
					</Table.Root>
				</div>

				<div>
					<h1 className="text-lg">خروج</h1>

					<Table.Root className="py-[2rem]">
						<Table.Head>
							<Table.Row className="select-none bg-gray-100 text-right">
								<Table.Cell as="th">ردیف</Table.Cell>
								<Table.Cell as="th">استفاده کننده</Table.Cell>
								<Table.Cell as="th">از شماره</Table.Cell>
								<Table.Cell as="th">تا شماره</Table.Cell>
								<Table.Cell as="th">مقدار</Table.Cell>
								<Table.Cell as="th">ثبت کننده</Table.Cell>
								<Table.Cell as="th">تاریخ</Table.Cell>
								<Table.Cell as="th">زمان</Table.Cell>
								<Table.Cell as="th">توضیحات</Table.Cell>
								<Table.Cell as="th" className="float-left">
									<Button
										onClick={() => {
											setActionModal(true);
											setMode("-");
										}}
									>
										عملیات
									</Button>
								</Table.Cell>
							</Table.Row>
						</Table.Head>
						<Table.Body>
							{history?.length ? (
								history.map((histories, index) => (
									<Table.Row key={histories.id}>
										<Table.Cell>{index + 1}</Table.Cell>
										<Table.Cell>{histories?.branch?.title}</Table.Cell>
										<Table.Cell>
											<span className="rounded-lg bg-red-100 p-1 text-red-800">
												{histories?.from?.toLocaleString()}
											</span>
										</Table.Cell>
										<Table.Cell>
											<span className="rounded-lg bg-red-100 p-1 text-red-800">
												{histories?.to?.toLocaleString()}
											</span>
										</Table.Cell>
										<Table.Cell>
											<span>
												{histories?.quantity
													? histories?.quantity?.toLocaleString()
													: "-"}
											</span>
										</Table.Cell>
										<Table.Cell>
											<span>
												{histories?.createdBy
													? `${histories?.createdBy?.name} ${histories?.createdBy?.lastname}`
													: "-"}
											</span>
										</Table.Cell>
										<Table.Cell>
											<span>
												{histories?.date
													? moment(histories?.date)
															.locale("fa")
															.format("YYYY/MM/DD")
													: "-"}
											</span>
										</Table.Cell>
										<Table.Cell>
											<span>
												{histories?.date
													? moment(histories?.date)
															.locale("fa")
															.format("HH:mm:ss")
													: "-"}
											</span>
										</Table.Cell>
										<Table.Cell>
											<div className="whitespace-pre-line">
												{histories.description}
											</div>
										</Table.Cell>
										<Table.Cell></Table.Cell>
									</Table.Row>
								))
							) : (
								<Table.Row>
									<Table.Cell colSpan={100}>تاریخچه ای یافت نشد...</Table.Cell>
								</Table.Row>
							)}
						</Table.Body>
					</Table.Root>

					<Pagination
						items={items}
						currentPage={currentPage}
						size={size}
						onPageChange={setCurrentPage}
						loading={loading}
						setSize={setSize}
					/>
				</div>
			</div>

			{actionModal && (
				<ProductAction
					isShow={actionModal}
					setShow={setActionModal}
					data={product}
					getCardData={getData}
					mode={mode}
				/>
			)}
		</>
	);
}
