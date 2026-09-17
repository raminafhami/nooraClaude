"use client";

import moment from "jalali-moment";
import { useCallback, useState } from "react";

import apiClient from "@/api/client";
import {
	Card,
	CardContent,
	CardHeader,
	CardNav,
	CardTitle,
} from "@/components/ui/card";
import { usePagination } from "@/components/ui/pagination/usePagination";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { getJalaliMonthsAndYears } from "@/utils/date/getJalaliMonthsAndYears";

const jalaliMonthsAndYears = getJalaliMonthsAndYears();

function NewCustomersCard() {
	const [dateIndex, setDateIndex] = useState<number>(0);

	const queryFn = useCallback(
		async (page: number, pageSize: number) => {
			const monthAndYear = jalaliMonthsAndYears[dateIndex];
			const firstDayOfMonth = moment(
				`${monthAndYear.jalaliYear}-${monthAndYear.jalaliMonth}`,
				"jYYYY-jMM",
			).startOf("jMonth");
			const lastDayOfMonth = moment(
				`${monthAndYear.jalaliYear}-${monthAndYear.jalaliMonth}`,
				"jYYYY-jMM",
			).endOf("jMonth");

			const searchParams = new URLSearchParams();
			searchParams.set("dateFrom", firstDayOfMonth.format("YYYY-MM-DD"));
			searchParams.set("dateTo", lastDayOfMonth.format("YYYY-MM-DD"));
			searchParams.set("page", page.toString());
			searchParams.set("size", pageSize.toString());

			const response = await apiClient.get({
				url: "reports/users",
				searchParams,
			});

			const data = response.result.data.map((x: any) => ({
				date: moment(x.createdAt, "jYYYY-jMM-jDD")
					.locale("fa")
					.format("jDD jMMMM jYYYY"),
				id: x.user.id,
				name: `${x.user.name} ${x.user.lastname}`,
			}));

			return [data, response.result.count] as const;
		},
		[dateIndex],
	);

	const { items, isLoading, offset, Pagination } = usePagination(queryFn);

	return (
		<div className="col-span-full lg:col-span-5 xl:col-span-6 2xl:col-span-3 3xl:col-span-3">
			<Card>
				<CardHeader orientation="horizontal">
					<CardTitle>مشتریان جدید</CardTitle>
					<CardNav>
						<div className="flex items-center gap-3">
							<label className="shrink-0">ماه:</label>
							<Select
								value={dateIndex.toString()}
								onValueChange={(value) => setDateIndex(Number(value))}
							>
								<SelectTrigger className="min-w-36">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{jalaliMonthsAndYears.map((x, index) => (
										<SelectItem key={index} value={index.toString()}>
											{`${x.jalaliMonthName} ${x.jalaliYear}`}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</CardNav>
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
								<TableHead className="w-48">تاریخ</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{items?.length ? (
								items.map((item, index) => (
									<TableRow key={item.id}>
										<TableCell>{offset + index + 1}</TableCell>
										<TableCell>{item.name}</TableCell>
										<TableCell>{item.date}</TableCell>
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

export { NewCustomersCard };
