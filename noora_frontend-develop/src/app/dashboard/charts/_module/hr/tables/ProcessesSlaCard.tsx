"use client";

import moment from "jalali-moment";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import {
	Card,
	CardContent,
	CardHeader,
	CardNav,
	CardTitle,
} from "@/components/ui/card";
import { DateInput } from "@/components/ui/date-input";
import { usePagination } from "@/components/ui/pagination/usePagination";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { getProcessesSlaReport } from "@/felo/processes/reports/getProcessesSlaReport";

type Data = {
	failPercentages: number;
	failProcess: number;
	processDefinitionKey: string;
	processDefinitionName: string;
	successPercentages: number;
	successProcess: number;
	totalProcess: number;
};

function ProcessesSlaCard() {
	const [fromDate, setFromDate] = useState<string>(() =>
		moment().subtract(2, "month").format("jYYYY/jMM/jDD"),
	);
	const [toDate, setToDate] = useState<string>(() =>
		moment().format("jYYYY/jMM/jDD"),
	);

	const fetchData = useCallback(
		async (page: number, pageSize: number) => {
			if (!fromDate || !toDate) {
				toast.error("برای دریافت گزارش تاریخ را انتخاب کنید.");
				return [[], 0] as [Data[], number];
			}

			const result = await getProcessesSlaReport({
				dateFrom: moment(fromDate, "jYYYY/jMM/jDD").format("YYYY-MM-DD"),
				dateTo: moment(toDate, "jYYYY/jMM/jDD").format("YYYY-MM-DD"),
				page,
				size: pageSize,
			});

			return [result.data, result.count] as [Data[], number];
		},
		[fromDate, toDate],
	);

	const {
		items: data,
		isLoading,
		offset,
		Pagination,
	} = usePagination(fetchData, undefined, 5);

	return (
		<div className="col-span-full xl:col-span-6">
			<Card>
				<CardHeader orientation="horizontal">
					<CardTitle>گزارش فرایندها</CardTitle>
					<CardNav className="gap-x-6">
						<div className="flex items-center gap-2">
							<label className="shrink-0">از تاریخ:</label>
							<DateInput
								maxDate={toDate}
								slotProps={{ input: { className: "max-w-40" } }}
								value={fromDate}
								onChange={(value: string | string[]) => {
									const newValue = Array.isArray(value) ? value[0] : value;
									setFromDate(newValue);
								}}
							/>
						</div>

						<div className="flex items-center gap-2">
							<label className="shrink-0">تا تاریخ:</label>
							<DateInput
								minDate={fromDate}
								slotProps={{ input: { className: "max-w-40" } }}
								value={toDate}
								onChange={(value: string | string[]) => {
									const newValue = Array.isArray(value) ? value[0] : value;
									setToDate(newValue);
								}}
							/>
						</div>
					</CardNav>
				</CardHeader>
				<CardContent className="px-0">
					<Table
						loading={isLoading}
						pagination={<Pagination setSize={null} />}
						slotProps={{ root: { className: "rounded-none border-x-0" } }}
					>
						<TableHeader>
							<TableRow className="whitespace-nowrap">
								<TableHead className="w-1">#</TableHead>
								<TableHead>نام فرایند</TableHead>
								<TableHead className="w-28">تعداد کارها</TableHead>
								<TableHead className="w-28">به موقع</TableHead>
								<TableHead className="w-28">با تاخیر</TableHead>
								<TableHead className="w-28">به موقع (%)</TableHead>
								<TableHead className="w-28">با تاخیر (%)</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{data?.length ? (
								data.map((item, index) => (
									<TableRow key={index} className="whitespace-nowrap">
										<TableCell>{offset + index + 1}</TableCell>
										<TableCell>{item.processDefinitionName}</TableCell>
										<TableCell>{item.totalProcess}</TableCell>
										<TableCell>{item.successProcess}</TableCell>
										<TableCell>{item.failProcess}</TableCell>
										<TableCell>{item.successPercentages}%</TableCell>
										<TableCell>{item.failPercentages}%</TableCell>
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

export { ProcessesSlaCard };
