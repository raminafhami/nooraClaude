"use client";

import moment from "jalali-moment";
import { useCallback, useEffect, useState } from "react";

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
import { Process } from "@/felo/processes/models";
import { getProcesses } from "@/felo/processes/services/getProcesses";
import { ObjectType } from "@/utils/object/ObjectType";

function InactiveCustomersCard() {
	const [monthRange, setMonthRange] = useState<string>("3");

	const [isLoadingDefinitions, setIsLoadingDefinitions] =
		useState<boolean>(true);
	const [definitions, setDefinitions] = useState<Process[]>();
	const definitionsObj = definitions?.reduce<ObjectType<string, Process>>(
		(acc, curr) => {
			acc[curr.key] = curr;
			return acc;
		},
		{},
	);

	const [selectedDefinitionKey, setSelectedDefinitionKey] = useState<string>();
	const selectedDefinition =
		definitionsObj && selectedDefinitionKey
			? definitionsObj[selectedDefinitionKey]
			: undefined;

	useEffect(() => {
		(async () => {
			try {
				setIsLoadingDefinitions(true);

				const processes = await getProcesses({
					filters: { key: { $regex: "^Inspection_Case" } },
				});

				const uniqueProcesses = new Map();
				processes.forEach((process) =>
					uniqueProcesses.set(process.key, process),
				);

				const filteredProcesses = Array.from(uniqueProcesses.values());
				setDefinitions(filteredProcesses);
			} catch (err: any) {
				console.error(err);
			} finally {
				setIsLoadingDefinitions(false);
			}
		})();
	}, []);

	const queryFn = useCallback(
		async (page: number, pageSize: number) => {
			const searchParams = new URLSearchParams();
			if (selectedDefinition) {
				searchParams.set("processDefinitionKey", selectedDefinition.key);
			}
			searchParams.set("month", monthRange);
			searchParams.set("page", page.toString());
			searchParams.set("size", pageSize.toString());

			const response = await apiClient.get({
				url: "reports/customers-recent-file",
				searchParams,
			});

			const data = response.result.data.map((x: any) => ({
				lastActionKey: x.processDefinitionKey,
				lastActionDate: moment(x.jalaliDate, "jYYYY-jMM-jDD")
					.locale("fa")
					.format("jDD jMMMM jYYYY"),
				id: x.customerId,
				name: x.customerName,
			}));

			return [data, response.result.count] as const;
		},
		[monthRange, selectedDefinition],
	);

	const { items, isLoading, offset, Pagination } = usePagination(queryFn);

	return (
		<div className="col-span-full 2xl:col-span-5 3xl:col-span-4">
			<Card>
				<CardHeader
					className="xs:flex-col sm:flex-row"
					orientation="horizontal"
				>
					<CardTitle>مشتریان غیر فعال</CardTitle>
					<CardNav className="gap-6">
						<div className="flex items-center gap-3">
							<label className="shrink-0">بازه زمانی:</label>
							<Select
								value={monthRange}
								onValueChange={(value) => setMonthRange(value)}
							>
								<SelectTrigger className="min-w-24">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{Array.from({ length: 12 }, (_, i) => i + 1).map(
										(x, index) => (
											<SelectItem key={index} value={x.toString()}>
												{`${x} ماه`}
											</SelectItem>
										),
									)}
								</SelectContent>
							</Select>
						</div>

						<div className="flex items-center gap-3">
							<label className="shrink-0">نوع درخواست:</label>
							<Select
								value={selectedDefinitionKey ?? ""}
								onValueChange={(value) =>
									setSelectedDefinitionKey(value !== "all" ? value : undefined)
								}
							>
								<SelectTrigger className="min-w-36">
									<SelectValue placeholder="همه درخواست ها" />
								</SelectTrigger>
								<SelectContent>
									{selectedDefinitionKey && (
										<SelectItem value="all">همه درخواست ها</SelectItem>
									)}
									{definitions?.map((x) => (
										<SelectItem key={x.key} value={x.key}>
											{x.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</CardNav>
				</CardHeader>

				<CardContent className="grow px-0">
					<Table
						loading={isLoading || isLoadingDefinitions}
						pagination={<Pagination setSize={null} />}
						slotProps={{
							root: { className: "border-x-0 rounded-none" },
						}}
					>
						<TableHeader>
							<TableRow>
								<TableHead className="w-1">#</TableHead>
								<TableHead>نام</TableHead>
								<TableHead className="w-48">تاریخ آخرین درخواست</TableHead>
								<TableHead className="w-48">نوع آخرین درخواست</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{items?.length ? (
								items.map((item, index) => (
									<TableRow key={item.id}>
										<TableCell>{offset + index + 1}</TableCell>
										<TableCell>{item.name}</TableCell>
										<TableCell>{item.lastActionDate}</TableCell>
										<TableCell>
											{definitionsObj?.[item.lastActionKey]?.name ??
												item.lastActionKey}
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

export { InactiveCustomersCard };
