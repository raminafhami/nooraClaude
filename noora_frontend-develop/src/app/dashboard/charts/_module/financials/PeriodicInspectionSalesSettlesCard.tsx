"use client";

import moment from "jalali-moment";
import { useEffect, useMemo, useState } from "react";
import { FaCheck } from "react-icons/fa6";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	CardContent,
	CardHeader,
	CardNav,
	CardTitle,
} from "@/components/ui/card";
import {
	Command,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
	instanceStatus,
	InstanceStatus,
	instanceStatusOptions,
} from "@/felo/instances/enums/InstanceStatus";
import { getInstancesPeriodicReport } from "@/felo/instances/services/getInstancesPeriodicReport";
import { cn } from "@/lib/utils";
import { SelectItemType } from "@/types/SelectItem";
import { Loading } from "@/ui/Loader";
import { getObjectEntries } from "@/utils/object/getObjectEntries";
import { getObjectKeys } from "@/utils/object/getObjectKeys";
import { ObjectType } from "@/utils/object/ObjectType";
import { toCurrency } from "@/utils/String";

import { CHARTS_COLORS } from "../ChartsConsts";

enum Mode {
	Sales = "sales",
	Settles = "settles",
}

const modeOptions: SelectItemType<Mode>[] = [
	{ value: Mode.Sales, label: "فروش" },
	{ value: Mode.Settles, label: "وصول" },
];

const PROCESS_DEFINITION_KEYS = {
	inspection_case_ic: { title: "بازرسی IC" },
	inspection_case_lc: { title: "بازرسی LC" },
	inspection_case_bank_coi: { title: "بازرسی COI بانکی" },
	inspection_case_sc: { title: "قرارداد نظارت" },
	inspection_case_coi: { title: "بازرسی COI" },
	inspection_case_source: { title: "تایید اصالت" },
	customssampling: { title: "نمونه برداری گمرکی" },
	productivesampling: { title: "نمونه برداری تولیدی" },
	boushehrsampling: { title: "نمونه برداری بوشهر" },
	bandarabbassampling: { title: "نمونه برداری بندرعباس" },
};

type DataItem = {
	date: string;
} & ObjectType<keyof typeof PROCESS_DEFINITION_KEYS, number>;

function PeriodicInspectionSalesSettlesCard() {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [salesData, setSalesData] = useState<DataItem[]>();
	const [settlesData, setSettlesData] = useState<DataItem[]>();

	const [statuses, setStatuses] = useState<InstanceStatus[]>([
		InstanceStatus.Active,
		InstanceStatus.Completed,
	]);

	const [mode, setMode] = useState<Mode>(Mode.Sales);
	const activeData = useMemo<DataItem[] | undefined>(
		() => (mode === "sales" ? salesData : settlesData),
		[mode, salesData, settlesData],
	);

	const [filteredTypes, setFilteredTypes] = useState<
		ObjectType<keyof typeof PROCESS_DEFINITION_KEYS, boolean>
	>(
		getObjectKeys(PROCESS_DEFINITION_KEYS).reduce(
			(acc, curr) => ({ ...acc, [curr]: true }),
			{} as ObjectType,
		),
	);

	useEffect(() => {
		async function loadSalesData(): Promise<DataItem[] | undefined> {
			if (statuses.length === 0) {
				return [];
			}

			try {
				const filters: string[] = [
					`processDefinitionKey::terms::${getObjectKeys(PROCESS_DEFINITION_KEYS)}`,
					// "status::match::completed",
				];

				if (statuses.length) {
					filters.push(`status::terms::${statuses.join(",")}`);
				}

				const result = await getInstancesPeriodicReport({
					period: "month",
					filters,
					groupBy: "processDefinitionKey",
					aggFunc: ["parameters.inspectionFeeInRial::sum"],
				});

				const salesData = getObjectEntries(
					result.reduce((acc, curr) => {
						const {
							date,
							key,
							doc_count,
							data: { ["parameters.inspectionFeeInRial"]: inspectionFee },
						} = curr;

						if (!acc[date]) {
							acc[date] = {};
						}

						acc[date][key] = inspectionFee.value;

						return acc;
					}, {}),
				).map(([date, items]) => ({
					date: moment(date as string, "jYYYY-jMM-jDD", "fa").format(
						"jMMMM jYYYY",
					),
					...items,
				}));

				return salesData;
			} catch (err) {
				console.error(err);
			}
		}

		async function loadSettlesData(): Promise<DataItem[] | undefined> {
			try {
				const filters: string[] = [
					`processDefinitionKey::terms::${getObjectKeys(PROCESS_DEFINITION_KEYS)}`,
					"parameters.invoicePaymentStatus::match::paid",
				];

				const result = await getInstancesPeriodicReport({
					period: "month",
					filters,
					groupBy: "processDefinitionKey",
					aggFunc: ["parameters.inspectionFeeInRial::sum"],
				});

				const settlesData = getObjectEntries(
					result.reduce((acc, curr) => {
						const {
							date,
							key,
							doc_count,
							data: { ["parameters.inspectionFeeInRial"]: inspectionFee },
						} = curr;

						if (!acc[date]) {
							acc[date] = {};
						}

						acc[date][key] = inspectionFee.value;

						return acc;
					}, {}),
				).map(([date, items]) => ({
					date: moment(date as string, "jYYYY-jMM-jDD", "fa").format(
						"jMMMM jYYYY",
					),
					...items,
				}));

				return settlesData;
			} catch (err) {
				console.error(err);
			}
		}

		(async () => {
			setIsLoading(true);

			const [salesData, settlesData] = await Promise.all([
				loadSalesData(),
				loadSettlesData(),
			]);

			setSalesData(salesData);
			setSettlesData(settlesData);

			setIsLoading(false);
		})();
	}, [statuses]);

	return (
		<>
			<CardHeader orientation="horizontal">
				<CardTitle>میزان فروش / وصول درخواست های بازرسی</CardTitle>
				<CardNav>
					<div className="flex items-center gap-2">
						<label className="shrink-0">نوع نمودار:</label>
						<Select value={mode} onValueChange={setMode as any}>
							<SelectTrigger className="min-w-36">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{modeOptions.map((x) => (
									<SelectItem key={x.value} value={x.value}>
										{x.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{mode === Mode.Sales && (
						<div className="flex items-center gap-2">
							<label className="shrink-0">وضعیت درخواست:</label>
							<Popover>
								<PopoverTrigger asChild>
									<Button className="h-10 px-2.5 text-start" variant="outline">
										<div className="w-32 truncate">
											{statuses
												.map((status) => instanceStatus[status])
												.join("، ")}
										</div>
									</Button>
								</PopoverTrigger>
								<PopoverContent align="start" className="w-full p-0">
									<Command>
										<CommandList className="py-1">
											<CommandGroup>
												{instanceStatusOptions
													.filter((x) => x.value !== InstanceStatus.Canceled)
													.map((status) => {
														const isSelected = statuses.includes(status.value);

														return (
															<CommandItem
																className="rounded-none"
																value={status.value}
																key={status.value}
																onSelect={() => {
																	if (isSelected) {
																		setStatuses((statuses) =>
																			statuses.filter(
																				(x) => x !== status.value,
																			),
																		);
																	} else {
																		setStatuses((statuses) => [
																			...statuses,
																			status.value,
																		]);
																	}
																}}
															>
																<div className="w-4">
																	{isSelected && <FaCheck />}
																</div>
																<span>{instanceStatus[status.value]}</span>
															</CommandItem>
														);
													})}
											</CommandGroup>
										</CommandList>
									</Command>
								</PopoverContent>
							</Popover>
						</div>
					)}
				</CardNav>
			</CardHeader>
			<CardContent>
				<div className="h-[28rem]" dir="ltr">
					{isLoading && !activeData ? (
						<Loading horizontalPlacement="center" />
					) : (
						<ResponsiveContainer width="100%" height="100%">
							<BarChart width={512} height={448} data={activeData}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="date" tickMargin={12} />
								<YAxis
									className="text-xs"
									dataKey={(obj) => {
										const values = { ...obj };
										delete values.date;

										return Math.max(...(Object.values(values) as number[]));
									}}
									tickFormatter={(value) =>
										value >= 1000
											? `${toCurrency((value / 1000000).toFixed())}M`
											: toCurrency(value.toString())
									}
									tickMargin={4}
									width={80}
								/>
								<Tooltip
									content={({ active, payload }) => {
										if (!active || !payload || !payload.length) return;

										const { date } = payload[0].payload;

										const total = payload
											.map(({ value }) => Number(value))
											.reduce((acc, curr) => {
												acc += curr;
												return acc;
											}, 0);

										return (
											<div
												className="space-y-2 rounded-xl border bg-white px-4 py-3 shadow-lg"
												dir="rtl"
											>
												<div className="flex justify-between">
													<div className="flex gap-1">{date}</div>
													<div className="flex gap-1">
														<span>
															{toCurrency((total / 1000000).toFixed(0))} میلیون
															ریال
														</span>
													</div>
												</div>

												<Separator className="!mb-3 h-0.5" />

												<div className="space-y-1.5">
													{payload.map(({ name, value }) => {
														const definitionIndex = getObjectEntries(
															filteredTypes,
														).findIndex((x) => x[0] === name);

														return (
															<div
																key={name}
																className="flex items-center gap-2"
															>
																<div
																	className="size-3 rounded-sm"
																	style={{
																		backgroundColor:
																			CHARTS_COLORS[definitionIndex],
																	}}
																></div>

																<span className="text-muted-foreground">
																	{
																		PROCESS_DEFINITION_KEYS[
																			name as keyof typeof PROCESS_DEFINITION_KEYS
																		].title
																	}
																	:
																</span>
																<div className="flex items-center gap-1">
																	<span>
																		{toCurrency(
																			((value as number) / 1000000).toFixed(0),
																		)}{" "}
																		میلیون ریال
																	</span>
																	<span>
																		(%
																		{((Number(value) / total) * 100).toFixed(2)}
																		)
																	</span>
																</div>
															</div>
														);
													})}
												</div>
											</div>
										);
									}}
								/>
								<Legend
									content={({ payload }) => {
										if (!payload) return;

										return (
											<ul
												className="mt-8 flex list-none flex-wrap items-center justify-center gap-x-6 gap-y-3"
												dir="rtl"
											>
												{getObjectKeys(PROCESS_DEFINITION_KEYS).map(
													(processDefinitionKey, index) => {
														const show = filteredTypes[processDefinitionKey];
														const color = show
															? CHARTS_COLORS[index % CHARTS_COLORS.length]
															: "#aaa";

														return (
															<li
																key={`item-${index}`}
																className="flex cursor-pointer items-center gap-1.5"
																style={{ color }}
																onClick={() => {
																	setFilteredTypes((previous) => ({
																		...previous,
																		[processDefinitionKey]: !show,
																	}));
																}}
															>
																<span
																	className="size-3 rounded-sm"
																	style={{ backgroundColor: color }}
																/>
																<span className="whitespace-nowrap">
																	{
																		PROCESS_DEFINITION_KEYS[
																			processDefinitionKey
																		].title
																	}
																</span>
															</li>
														);
													},
												)}
											</ul>
										);
									}}
								/>
								{getObjectEntries(filteredTypes).map(
									([processDefinitionKey, show], index) => {
										return (
											show && (
												<Bar
													key={processDefinitionKey}
													dataKey={processDefinitionKey}
													display={
														!filteredTypes[processDefinitionKey]
															? "none"
															: undefined
													}
													fill={CHARTS_COLORS[index]}
													radius={[8, 8, 0, 0]}
													// stackId="1"
												/>
											)
										);
									},
								)}
							</BarChart>
						</ResponsiveContainer>
					)}
				</div>
			</CardContent>
		</>
	);
}

export { PeriodicInspectionSalesSettlesCard };
