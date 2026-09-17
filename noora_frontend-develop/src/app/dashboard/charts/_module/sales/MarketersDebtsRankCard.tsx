"use client";

import moment from "jalali-moment";
import { useEffect, useState } from "react";

import {
  CardContent,
  CardHeader,
  CardNav,
  CardTitle,
} from "@/components/ui/card";
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
import { getInstancesReport } from "@/felo/instances/services/getInstancesReport";
import { SelectItemType } from "@/types/SelectItem";
import { toCurrency } from "@/utils/String";

type DataItem = {
	marketer: { id: string; name: string };
	inspectionFeeTotal: number;
	total: number;
};

const dateRangeOptions: SelectItemType[] = [
	{ value: "7", label: "7 روز گذشته" },
	{ value: "30", label: "30 روز گذشته" },
	{ value: "-1", label: "از ابتدا" },
];

function MarketersDebtsRankCard() {
	const [dateRange, setDateRange] = useState<string>("30");

	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [data, setData] = useState<DataItem[]>();

	useEffect(() => {
		(async () => {
			try {
				setIsLoading(true);

				const filters: string[] = [
					"status::match::completed",
					"parameters.assignees.marketer::exists",
					"parameters.invoicePaymentStatus::exists",
					"parameters.invoicePaymentStatus::notMatch::paid",
				];

				switch (dateRange) {
					case "7": {
						const today = moment(new Date());
						const rangeStart = today.clone().subtract(7, "days");
						filters.push(
							`date::range::${rangeStart.format("YYYY-MM-DD")},${today.format("YYYY-MM-DD")}`,
						);
						break;
					}
					case "30": {
						const today = moment(new Date());
						const rangeStart = today.clone().subtract(30, "days");
						filters.push(
							`date::range::${rangeStart.format("YYYY-MM-DD")},${today.format("YYYY-MM-DD")}`,
						);
						break;
					}
				}

				const result = await getInstancesReport({
					page: 0,
					size: 100,
					filters,
					groupBy: "parameters.assignees.marketer.id",
					aggFunc: "parameters.inspectionFeeInRial::sum",
					select: "parameters.assignees.marketer",
				});

				const data = result.data
					.sort(
						(a, b) =>
							b["parameters.inspectionFeeInRial"].value -
							a["parameters.inspectionFeeInRial"].value,
					)
					.slice(0, 10)
					.map((x) => ({
						marketer: x.select.parameters.assignees.marketer,
						inspectionFeeTotal: x["parameters.inspectionFeeInRial"].value,
						total: x.doc_count,
					}));
				setData(data);
			} catch (err) {
				console.error(err);
			} finally {
				setIsLoading(false);
			}
		})();
	}, [dateRange]);

	return (
		<>
			<CardHeader orientation="horizontal">
				<CardTitle>رتبه بندی بازاریاب ها بر اساس میزان بدهی</CardTitle>
				<CardNav>
					<div className="flex items-center gap-2">
						<label className="shrink-0">دوره زمانی:</label>
						<Select value={dateRange} onValueChange={setDateRange}>
							<SelectTrigger className="min-w-36">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{dateRangeOptions.map((x) => (
									<SelectItem key={x.value} value={x.value}>
										{x.label}
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
					slotProps={{
						root: { className: "border-x-0 rounded-none" },
					}}
				>
					<TableHeader>
						<TableRow>
							<TableHead className="w-1">#</TableHead>
							<TableHead>نام</TableHead>
							<TableHead className="w-48">تعداد درخواست ها</TableHead>
							<TableHead className="w-64">میزان وصول (ریال)</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{data?.map((item, index) => (
							<TableRow key={item.marketer.id}>
								<TableCell>{index + 1}</TableCell>
								<TableCell>{item.marketer.name}</TableCell>
								<TableCell>
									<span className="tracking-wide">
										{toCurrency(item.total.toString())}
									</span>
								</TableCell>
								<TableCell>
									<span className="tracking-wide">
										{toCurrency(item.inspectionFeeTotal.toString())}
									</span>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</>
	);
}

export { MarketersDebtsRankCard };
