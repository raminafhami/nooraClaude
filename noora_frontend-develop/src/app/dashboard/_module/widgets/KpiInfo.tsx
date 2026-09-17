"use client";

import moment from "jalali-moment";
import { useCallback, useEffect, useState } from "react";
import { Cell, Pie, PieChart } from "recharts";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import {
	Card,
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
import { getInstancesReport } from "@/felo/instances/services/getInstancesReport";
import { KpiApi } from "@/kpi/models/Kpi";
import { getKpi } from "@/kpi/services/getKpi";
import { getColorForPercentage } from "@/utils/getColorByPercentage";

const KpiInfo = () => {
	const user = useLoggedInUser();
	const [userFilesNo, setUserFilesNo] = useState<number>();
	const [kpiList, setKpiList] = useState<KpiApi[]>();
	const [selectedKpi, setSelectedKpi] = useState<KpiApi>();

	useEffect(() => {
		const checkUserHaveKpi = async () => {
			const result = await getKpi({
				filters: { userId: user.identity.id },
			});
			const fileCountKpi = result.find((x) =>
				x.targets.some((e) => e.metric === "fileCount"),
			);

			if (fileCountKpi) {
				setSelectedKpi(fileCountKpi);
			}

			setKpiList(
				result.filter((x) => x.targets.some((t) => t.metric === "fileCount")),
			);
		};
		checkUserHaveKpi();
	}, []);

	const fetchKpiReport = useCallback(async () => {
		if (selectedKpi) {
			try {
				const filters: string[] = [
					`processDefinitionKey::match::${selectedKpi.processKeys.join(",")}`,
					"status::match::completed,active",
					`parameters.assignees.coordinator.id::term::${user.identity.id}`,
				];

				const rangeStart = new Date(
					moment(selectedKpi.startDate).format("YYYY-MM-DD"),
				)
					.toISOString()
					.split("T")[0];

				const rangeEnd = new Date(
					moment(selectedKpi.endDate).format("YYYY-MM-DD"),
				)
					.toISOString()
					.split("T")[0];

				filters.push(`date::range::${rangeStart},${rangeEnd}`);

				const res = await getInstancesReport({
					page: 0,
					size: 100,
					filters,
				});
				setUserFilesNo(res.total);
			} catch (err) {
				console.error(err);
			}
		}
	}, [selectedKpi, user.identity.id]);

	useEffect(() => {
		fetchKpiReport();
	}, [fetchKpiReport, selectedKpi]);

	return (
		<Card className="relative col-span-full rounded-2xl border-none shadow-none lg:col-span-6 2xl:col-span-3">
			<CardHeader orientation="horizontal" className="pb-0">
				<CardTitle className="text-base font-light">
					نمودار شاخص عملکرد
				</CardTitle>
				<CardNav className="min-w-36">
					<Select
						onValueChange={(value: string) => {
							setSelectedKpi(kpiList?.find((kpi) => kpi.id === value));
						}}
						value={selectedKpi?.id}
					>
						<SelectTrigger>
							<SelectValue placeholder="انتخاب شاخص" />
						</SelectTrigger>
						<SelectContent>
							{kpiList?.map((kpi) => (
								<SelectItem key={kpi.id} value={kpi.id}>
									{kpi.title}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</CardNav>
			</CardHeader>
			<CardContent className="p-0">
				<KpiChart totalFiles={userFilesNo} kpi={selectedKpi} />
			</CardContent>
		</Card>
	);
};

export { KpiInfo };

const KpiChart = ({
	totalFiles,
	kpi,
}: {
	totalFiles?: number;
	kpi?: KpiApi;
}) => {
	const safeMetric = kpi?.targets[0].value ?? 0;
	const safeTotal = totalFiles ?? 0;

	const percentage =
		safeTotal > 0 ? Math.min((safeTotal / safeMetric) * 100, 100) : 0;

	const data = [
		{
			name: "Metric",
			value: percentage,
			color: getColorForPercentage(percentage / 100, 0.8),
		},
		{ name: "Remaining", value: 100 - percentage, color: "#dedede" },
	];

	const iR = 55;
	const oR = 100;

	return (
		<div className="flex flex-col items-center justify-center px-6">
			<div className="mt-2 flex w-full justify-end">
				<span>
					{kpi && (
						<>
							{moment(kpi?.startDate).format("jYYYY/jMM/jDD")} تا{" "}
							{moment(kpi?.endDate).format("jYYYY/jMM/jDD")}
						</>
					)}
				</span>
			</div>
			<PieChart width={400} height={180}>
				<Pie
					dataKey="value"
					startAngle={210}
					endAngle={-30}
					data={data}
					cx="50%"
					cy="60%"
					innerRadius={iR}
					outerRadius={oR}
					// stroke="gray"
				>
					{data.map((entry, index) => (
						<Cell key={`cell-${index}`} fill={entry.color} />
					))}
				</Pie>
			</PieChart>

			<div className="absolute bottom-16 mr-36 text-[#0A263B]">
				{totalFiles}
			</div>
			<div className="absolute bottom-16 left-[48%] text-[#0A263B]">
				{percentage.toFixed(0)}%
			</div>
			<div className="absolute bottom-16 ml-36 text-[#0A263B]">
				{kpi?.targets[0].value}
			</div>
		</div>
	);
};
