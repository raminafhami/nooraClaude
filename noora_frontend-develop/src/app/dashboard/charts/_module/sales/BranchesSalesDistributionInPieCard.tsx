import { useEffect, useMemo, useState } from "react";
import {
  Cell,
  Pie,
  PieChart,
  PieLabelRenderProps,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getInstancesReport } from "@/felo/instances/services/getInstancesReport";
import { Loading } from "@/ui/Loader";
import { toCurrency } from "@/utils/String";

type DataItem = {
	name: string;
	value: number;
	docs: number;
};

const COLORS = [
	"#8884d8",
	"#8dd1e1",
	"#82ca9d",
	"#a4de6c",
	"#d0ed57",
	"#ffc658",
	"#ff8042",
	"#d84543",
	"#6a0dad",
];

function renderCustomizedLabel({
	cx,
	cy,
	midAngle,
	outerRadius,
	name,
	value,
	dataTotal,
}: PieLabelRenderProps & {
	name: string;
	value: number;
	dataTotal: number;
}) {
	if (
		cx === undefined ||
		cy === undefined ||
		outerRadius === undefined ||
		midAngle === undefined
	) {
		return null;
	}

	const percentage = ((value / dataTotal) * 100).toFixed(1);

	const radius = Number(outerRadius) + 15;
	const x = Number(cx) + radius * Math.cos((-Number(midAngle) * Math.PI) / 180);
	const y = Number(cy) + radius * Math.sin((-Number(midAngle) * Math.PI) / 180);

	return (
		<text
			x={x}
			y={y}
			fill="black"
			textAnchor={x > Number(cx) ? "end" : "start"}
			dominantBaseline="central"
			style={{ fontSize: "12px", fontWeight: "normal" }}
		>
			{`${name} (${percentage}%)`}
		</text>
	);
}

function BranchesSalesDistributionInPieCard() {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [data, setData] = useState<DataItem[]>();
	const dataTotal = useMemo<number>(
		() => data?.reduce((total, branch) => total + branch.value, 0) ?? 0,
		[data],
	);

	useEffect(() => {
		(async () => {
			try {
				setIsLoading(true);

				const filters: string[] = ["parameters.branch::exists"];

				const result = await getInstancesReport({
					page: 0,
					size: 100,
					filters,
					groupBy: "parameters.branch.id",
					aggFunc: "parameters.inspectionFeeInRial::sum",
					select: "parameters.branch",
				});

				const data = result.data
					// .sort(
					// 	(a, b) =>
					// 		b["parameters.inspectionFeeInRial"].value -
					// 		a["parameters.inspectionFeeInRial"].value,
					// )
					// .slice(0, 10)
					.map((x) => ({
						// marketer: x.select.parameters.assignees.marketer,
						// inspectionFeeTotal: x["parameters.inspectionFeeInRial"].value,
						// total: x.doc_count,
						name: x.select.parameters.branch.name,
						value: x["parameters.inspectionFeeInRial"].value,
						docs: x.doc_count,
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
				<CardTitle>فروش به تفکیک شعب (بازرسی)</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="h-[28rem]">
					{isLoading || !data ? (
						<Loading horizontalPlacement="center" />
					) : (
						<ResponsiveContainer width="100%" height="100%">
							<PieChart width={512} height={448}>
								<Pie
									data={data}
									outerRadius={160}
									innerRadius={32}
									fill="#8884d8"
									dataKey="value"
									labelLine={false}
									label={({ name, value, ...props }) =>
										renderCustomizedLabel({ name, value, dataTotal, ...props })
									}
								>
									{data.map((entry, index) => (
										<Cell
											key={`cell-${index}`}
											fill={COLORS[index % COLORS.length]}
										/>
									))}
								</Pie>
								<Tooltip
									content={({ active, payload }) => {
										if (active && payload && payload.length) {
											const { name, value } = payload[0];
											const { docs } = data.find((x) => x.name === name) ?? {};
											const percentage = ((+value! / dataTotal) * 100).toFixed(
												1,
											);

											return (
												<div className="space-y-1 rounded-xl border bg-white px-4 py-3 shadow-lg">
													<div className="flex gap-1">
														<span className="text-muted-foreground">نام:</span>
														{name}
													</div>
													<div className="flex gap-1">
														<span className="text-muted-foreground">مبلغ:</span>
														{toCurrency(value?.toString() ?? "")} ریال
													</div>
													<div className="flex gap-1">
														<span className="text-muted-foreground">
															تعداد:
														</span>
														{docs}
													</div>
													<div className="flex gap-1">
														<span className="text-muted-foreground">درصد:</span>
														{percentage}%
													</div>
												</div>
											);
										}

										return null;
									}}
								/>
							</PieChart>
						</ResponsiveContainer>
					)}
				</div>
			</CardContent>
		</>
	);
}

export { BranchesSalesDistributionInPieCard };
