"use client";

import moment from "jalali-moment";
import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  CardContent,
  CardHeader,
  CardNav,
  CardTitle,
} from "@/components/ui/card";
import { DateInput } from "@/components/ui/date-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { getInstancesPeriodicReport } from "@/felo/instances/services/getInstancesPeriodicReport";
import { Loading } from "@/ui/Loader";
import { getJalaliMonthsAndYears } from "@/utils/date/getJalaliMonthsAndYears";
import { getJalaliYears } from "@/utils/date/getJalaliYears";
import { getObjectEntries } from "@/utils/object/getObjectEntries";
import { getObjectKeys } from "@/utils/object/getObjectKeys";
import { ObjectType } from "@/utils/object/ObjectType";
import { toCurrency } from "@/utils/String";

import { CHARTS_COLORS } from "../ChartsConsts";

const periodOptions = [
	{ value: "day", label: "روزانه" },
	// { value: "week", label: "هفتگی" },
	{ value: "month", label: "ماهانه" },
	{ value: "year", label: "سالانه", visible: false },
] as const;

type Period = (typeof periodOptions)[number]["value"];

const jalaliMonthsAndYears = getJalaliMonthsAndYears();

const jalaliYears = getJalaliYears();

type LineType = "sales" | "incomes" | "costs";

// TODO: add "سود", and "وصول نشده"
const lineType: ObjectType<LineType, string> = {
	sales: "فروش کل",
	incomes: "درآمد",
	costs: "هزینه",
};

function PeriodicInspectionFinancialNumbersCard({
	title,
	definitionKey,
	onlyTotal,
}: {
	title: string;
	definitionKey: string[];
	onlyTotal?: boolean;
}) {
	const [period, setPeriod] = useState<Period>("day");
	const [fromDate, setFromDate] = useState<string>(() =>
		moment().subtract(30, "days").format("jYYYY/jMM/jDD"),
	);
	const [toDate, setToDate] = useState<string>(() =>
		moment().format("jYYYY/jMM/jDD"),
	);

	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [data, setData] = useState<any[]>([]);

	const [filteredTypes, setFilteredTypes] = useState<
		ObjectType<keyof typeof lineType, boolean>
	>(
		getObjectKeys(lineType).reduce(
			(acc, curr) => ({ ...acc, [curr]: true }),
			{} as ObjectType,
		),
	);

	useEffect(() => {
		(async () => {
			try {
				setIsLoading(true);

				if (!fromDate || !toDate) {
					setData([]);
					return;
				}

				const filters: string[] = [
					`processDefinitionKey::terms::${definitionKey.map((x) => x.toLowerCase()).join(",")}`,
					`date::range::${moment(fromDate, "jYYYY/jMM/jDD").format("YYYY-MM-DD")},${moment(toDate, "jYYYY/jMM/jDD").format("YYYY-MM-DD")}`,
					// "status::match::completed",
				];

				const result = await getInstancesPeriodicReport({
					period,
					filters,
					groupBy: "processDefinitionKey",
					aggFunc: [
						"parameters.inspectionFeeInRial::sum",
						"inspectionCosts.total::sum",
					],
				});

				const data = getObjectEntries(
					result.reduce<ObjectType<string, ObjectType<LineType>>>(
						(acc, curr) => {
							const {
								date,
								key,
								doc_count,
								data: {
									["parameters.inspectionFeeInRial"]: { value: sales },
									["inspectionCosts.total"]: {
										["inspectionCosts.total"]: { value: costs },
									},
								},
							} = curr;

							if (!acc[date]) {
								acc[date] = { sales: 0, incomes: 0, costs: 0 };
							}

							acc[date] = {
								sales: acc[date].sales + sales,
								incomes: acc[date].incomes + (sales - costs),
								costs: acc[date].costs + costs,
							};

							return acc;
						},
						{},
					),
				).map(([date, { sales, costs, incomes }]) => ({
					date: moment(date as string, "jYYYY-jMM-jDD", "fa").format(
						period === "day"
							? "jYYYY/jMM/jDD"
							: period === "year"
								? "jYYYY"
								: "jMMMM jYYYY",
					),
					sales,
					costs,
					incomes,
				}));

				setData(data);
			} catch (err) {
				console.error(err);
			} finally {
				setIsLoading(false);
			}
		})();
	}, [definitionKey, fromDate, period, toDate]);

	return (
		<>
			<CardHeader orientation="horizontal">
				<CardTitle>{title}</CardTitle>
				<CardNav>
					<div className="flex items-center gap-2">
						<label className="shrink-0">بازه زمانی:</label>
						<Select
							value={period}
							onValueChange={(value: Period) => {
								setPeriod(value);

								let from: string = "";
								let to: string = "";

								if (value === "day") {
									from = moment().subtract(30, "days").format("jYYYY/jMM/jDD");
									to = moment().format("jYYYY/jMM/jDD");
								} else if (value === "month") {
									from = moment()
										.subtract(5, "jMonth")
										.startOf("jMonth")
										.format("jYYYY/jMM/jDD");
									to = moment().endOf("jMonth").format("jYYYY/jMM/jDD");
								}

								console.info({ from, to });
								setFromDate(from);
								setToDate(to);
							}}
						>
							<SelectTrigger className="min-w-36">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{periodOptions.map((x) => (
									<SelectItem
										key={x.value}
										value={x.value}
										visible={(x as any).visible}
									>
										{x.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="flex items-center gap-2">
						<label className="shrink-0">از تاریخ:</label>
						<div key={period} className="md:max-w-40">
							{period === "day" ? (
								<DateInput
									maxDate={toDate}
									value={fromDate}
									onChange={(value) => {
										setFromDate(value as string);
									}}
								/>
							) : period === "month" ? (
								<Select value={fromDate} onValueChange={setFromDate}>
									<SelectTrigger className="min-w-40">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{jalaliMonthsAndYears.map((x, index) => {
											const value = `${x.jalaliYear}/${x.jalaliMonth}/01`;
											const disabled = toDate ? value >= toDate : false;

											return (
												<SelectItem
													key={index}
													disabled={disabled}
													value={value}
												>
													{x.jalaliMonthName} {x.jalaliYear}
												</SelectItem>
											);
										})}
									</SelectContent>
								</Select>
							) : (
								period === "year" && (
									<Select value={fromDate} onValueChange={setFromDate}>
										<SelectTrigger className="min-w-40">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{jalaliYears.map((x, index) => {
												const value = `${x.jalaliYear}/01/01`;
												const disabled = toDate ? value >= toDate : false;

												return (
													<SelectItem
														key={index}
														disabled={disabled}
														value={value}
													>
														{x.jalaliYear}
													</SelectItem>
												);
											})}
										</SelectContent>
									</Select>
								)
							)}
						</div>
					</div>

					<div className="flex items-center gap-2">
						<label className="shrink-0">تا تاریخ:</label>
						<div key={period} className="md:max-w-40">
							{period === "day" ? (
								<DateInput
									minDate={fromDate}
									value={toDate}
									onChange={(value) => {
										setToDate(value as string);
									}}
								/>
							) : period === "month" ? (
								<Select value={toDate} onValueChange={setToDate}>
									<SelectTrigger className="min-w-40">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{jalaliMonthsAndYears.map((x, index) => {
											const value = moment(
												`${x.jalaliYear}-${x.jalaliMonth}`,
												"jYYYY-jMM",
											)
												.endOf("jMonth")
												.format("jYYYY/jMM/jDD");
											const disabled = fromDate ? value < fromDate : false;

											return (
												<SelectItem
													key={index}
													disabled={disabled}
													value={value}
												>
													{x.jalaliMonthName} {x.jalaliYear}
												</SelectItem>
											);
										})}
									</SelectContent>
								</Select>
							) : (
								period === "year" && (
									<Select value={toDate} onValueChange={setToDate}>
										<SelectTrigger className="min-w-40">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{jalaliYears.map((x, index) => {
												const value = moment(`${x.jalaliYear}`, "jYYYY")
													.endOf("jYear")
													.format("jYYYY/jMM/jDD");
												const disabled = fromDate ? value < fromDate : false;

												return (
													<SelectItem
														key={index}
														disabled={disabled}
														value={value}
													>
														{x.jalaliYear}
													</SelectItem>
												);
											})}
										</SelectContent>
									</Select>
								)
							)}
						</div>
					</div>
				</CardNav>
			</CardHeader>
			<CardContent>
				<div className="h-[28rem]" dir="ltr">
					{isLoading && !data ? (
						<Loading horizontalPlacement="center" />
					) : (
						<ResponsiveContainer width="100%" height="100%">
							<LineChart width={512} height={448} data={data}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="date" tickMargin={12} />
								<YAxis
									className="text-xs"
									dataKey="sales"
									tickFormatter={(value) =>
										value >= 1000
											? `${toCurrency((value / 1000000).toFixed())}M`
											: toCurrency(value.toString())
									}
									tickMargin={4}
									width={80}
								/>
								<Tooltip
									content={({ active, payload, label }) => {
										if (!active || !payload || !payload.length) return;

										const date =
											period === "day"
												? moment(label, "jYYYY/jMM/jDD")
														.locale("fa")
														.format("dddd، jDD jMMMM jYYYY")
												: label;

										return (
											<div
												className="min-w-48 space-y-2 rounded-xl border bg-white px-4 py-3 shadow-lg"
												dir="rtl"
											>
												<div className="flex justify-between">{date}</div>

												<Separator className="!mb-3 h-0.5" />

												<div className="space-y-1.5">
													{payload.map((pld: any, index: number) => (
														<div
															key={index}
															className="flex items-center gap-2"
														>
															<div
																className="size-3 rounded-sm"
																style={{
																	backgroundColor: CHARTS_COLORS[index],
																}}
															></div>
															<span className="text-muted-foreground">
																{lineType[pld.dataKey as LineType]}:
															</span>
															<span>
																{toCurrency(
																	((pld.value as number) / 1000000).toFixed(0),
																)}{" "}
																میلیون ریال
															</span>
														</div>
													))}
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
												{(onlyTotal
													? (["sales"] as LineType[])
													: getObjectKeys(lineType)
												).map((type, index) => {
													const show = filteredTypes[type];
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
																	[type]: !show,
																}));
															}}
														>
															<span
																className="size-3 rounded-sm"
																style={{ backgroundColor: color }}
															/>
															<span>{lineType[type]}</span>
														</li>
													);
												})}
											</ul>
										);
									}}
								/>

								{onlyTotal ? (
									<Line
										type="monotone"
										dataKey="sales"
										fill={CHARTS_COLORS[0]}
										stroke={CHARTS_COLORS[0]}
										strokeWidth={2}
									/>
								) : (
									getObjectEntries(filteredTypes).map(([type, show], index) => {
										return (
											show && (
												<Line
													key={type}
													type="monotone"
													dataKey={type}
													display={!filteredTypes[type] ? "none" : undefined}
													fill={CHARTS_COLORS[index]}
													stroke={CHARTS_COLORS[index]}
													strokeWidth={2}
												/>
											)
										);
									})
								)}
							</LineChart>
						</ResponsiveContainer>
					)}
				</div>
			</CardContent>
		</>
	);
}

export { PeriodicInspectionFinancialNumbersCard };
