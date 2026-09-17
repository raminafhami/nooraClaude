"use client";

import moment from "jalali-moment";
import { useEffect, useState } from "react";
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

import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getInstancesPeriodicReport } from "@/felo/instances/services/getInstancesPeriodicReport";
import { Loading } from "@/ui/Loader";
import { getObjectEntries } from "@/utils/object/getObjectEntries";
import { getObjectKeys } from "@/utils/object/getObjectKeys";
import { ObjectType } from "@/utils/object/ObjectType";
import { toCurrency } from "@/utils/String";

import { CHARTS_COLORS } from "../ChartsConsts";

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

function PeriodicInspectionInstancesCard() {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [data, setData] = useState<DataItem[]>();

	const [filteredTypes, setFilteredTypes] = useState<
		ObjectType<keyof typeof PROCESS_DEFINITION_KEYS, boolean>
	>(
		getObjectKeys(PROCESS_DEFINITION_KEYS).reduce(
			(acc, curr) => ({ ...acc, [curr]: true }),
			{} as ObjectType,
		),
	);

	useEffect(() => {
		(async () => {
			try {
				setIsLoading(true);

				const filters: string[] = [
					`processDefinitionKey::terms::${getObjectKeys(PROCESS_DEFINITION_KEYS)}`,
					"status::match::completed",
				];

				const result = await getInstancesPeriodicReport({
					period: "month",
					filters,
					groupBy: "processDefinitionKey",
					aggFunc: ["parameters.inspectionFeeInRial::sum"],
				});

				const data = getObjectEntries(
					result.reduce((acc, curr) => {
						const { date, key, doc_count } = curr;

						if (!acc[date]) {
							acc[date] = {};
						}

						acc[date][key] = doc_count;

						return acc;
					}, {}),
				).map(([date, items]) => ({
					date: moment(date as string, "jYYYY-jMM-jDD", "fa").format(
						"jMMMM jYYYY",
					),
					...items,
				}));
				setData(data);
			} catch (err) {
				console.error(err);
			} finally {
				setIsLoading(false);
			}
		})();
	}, []);

	return (
		<>
			<CardHeader>
				<CardTitle>تعداد انواع درخواست های بازرسی</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="h-[28rem]" dir="ltr">
					{isLoading && !data ? (
						<Loading horizontalPlacement="center" />
					) : (
						<ResponsiveContainer width="100%" height="100%">
							<BarChart width={512} height={448} data={data}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="date" tickMargin={12} />
								<YAxis
									className="text-xs"
									dataKey={(obj) => {
										const values = { ...obj };
										delete values.date;

										return (Object.values(values) as number[]).reduce(
											(acc, curr) => acc + curr,
											0,
										);
									}}
									tickFormatter={(value) =>
										value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value
									}
									tickMargin={4}
									width={64}
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
													<span>{date}</span>
													<span>{toCurrency(total.toString())} درخواست</span>
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
																		{toCurrency(value?.toString() ?? "")}
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
																<span>
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
													// radius={[8, 8, 0, 0]}
													stackId="1"
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

export { PeriodicInspectionInstancesCard };
