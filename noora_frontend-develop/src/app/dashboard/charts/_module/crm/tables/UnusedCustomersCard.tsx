"use client";

import { useCallback } from "react";

import apiClient from "@/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePagination } from "@/components/ui/pagination/usePagination";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

function UnusedCustomersCard() {
	const queryFn = useCallback(async (page: number, pageSize: number) => {
		const searchParams = new URLSearchParams();
		searchParams.set("page", page.toString());
		searchParams.set("size", pageSize.toString());

		const response = await apiClient.get({
			url: "reports/users/no-files",
			searchParams,
		});

		const data = response.result.data.map((x: any) => ({
			id: x.id,
			name: `${x.name} ${x.lastname}`,
			phoneNo: x.phoneNo,
		}));

		return [data, response.result.count] as const;
	}, []);

	const { items, isLoading, offset, Pagination } = usePagination(queryFn);

	return (
		<div className="col-span-full lg:col-span-7 xl:col-span-6 2xl:col-span-4 3xl:col-span-3">
			<Card>
				<CardHeader>
					<CardTitle className="min-h-10">مشتریان بدون فایل</CardTitle>
				</CardHeader>

				<CardContent className="grow px-0">
					<Table
						loading={isLoading}
						pagination={<Pagination setSize={null} />}
						slotProps={{
							root: { className: "border-x-0 rounded-none" },
						}}
					>
						<TableHeader>
							<TableRow>
								<TableHead className="w-1">#</TableHead>
								<TableHead>نام</TableHead>
								<TableHead className="w-48">شماره همراه</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{items?.length ? (
								items.map((item, index) => (
									<TableRow key={item.id}>
										<TableCell>{offset + index + 1}</TableCell>
										<TableCell>{item.name}</TableCell>
										<TableCell className="tracking-wide">
											{item.phoneNo}
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
		</div>
	);
}

export { UnusedCustomersCard };
