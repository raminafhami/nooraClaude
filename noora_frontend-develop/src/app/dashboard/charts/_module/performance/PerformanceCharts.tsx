"use client";

import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Legend,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PerformanceCharts as Charts } from "@/features/performance-report/api";

const COLORS = ["#0f766e", "#b45309", "#1d4ed8", "#be123c", "#4d7c0f", "#6d28d9"];

function BarCard({
	title,
	data,
	dataKey = "count",
}: {
	title: string;
	data: { name: string; count?: number; minutes?: number }[] | null;
	dataKey?: "count" | "minutes";
}) {
	if (!data?.length) return null;
	return (
		<Card className="col-span-12 lg:col-span-6">
			<CardHeader>
				<CardTitle>{title}</CardTitle>
			</CardHeader>
			<CardContent className="h-72">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart data={data}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="name" interval={0} tick={{ fontSize: 11 }} />
						<YAxis />
						<Tooltip />
						<Bar dataKey={dataKey} fill="#0f766e" />
					</BarChart>
				</ResponsiveContainer>
			</CardContent>
		</Card>
	);
}

function PerformanceCharts({ charts }: { charts: Charts | null }) {
	if (!charts) return null;
	const completed = charts.completedVsIncomplete
		? [
				{ name: "تکمیل‌شده", count: charts.completedVsIncomplete.completed },
				{ name: "تکمیل‌نشده", count: charts.completedVsIncomplete.incomplete },
			]
		: null;

	return (
		<div className="grid grid-cols-12 gap-3">
			<Card className="col-span-12">
				<CardHeader>
					<CardTitle>
						شاخص‌ها از {charts.fromLabel} تا {charts.toLabel}
					</CardTitle>
				</CardHeader>
				<CardContent className="grid grid-cols-2 gap-2 md:grid-cols-4 text-sm">
					<div>حجم فعالیت: {charts.summary.volume}</div>
					<div>
						درصد تکمیل کارها:{" "}
						{charts.summary.taskCompletionPercent === null
							? "داده‌ای نیست"
							: `${charts.summary.taskCompletionPercent}%`}
					</div>
					<div>
						به‌موقع:{" "}
						{charts.summary.onTimePercent === null
							? "داده‌ای نیست"
							: `${charts.summary.onTimePercent}%`}
					</div>
					<div>
						تاخیر:{" "}
						{charts.summary.delayed === null ? "داده‌ای نیست" : charts.summary.delayed}
					</div>
				</CardContent>
			</Card>
			<p className="col-span-12 text-sm text-muted-foreground">{charts.note}</p>
			<BarCard title="تعداد فعالیت روزانه" data={charts.dailyActivityCount} />
			<BarCard title="تعداد فعالیت به تفکیک کارمند" data={charts.byEmployee} />
			<BarCard title="زمان صرف‌شده (دقیقه)" data={charts.timeSpent} dataKey="minutes" />
			<BarCard title="به تفکیک نوع فعالیت" data={charts.byActivityType} />
			<BarCard title="به تفکیک ماژول" data={charts.bySourceModule} />
			<BarCard title="همکاری" data={charts.collaboration} />
			<BarCard title="مقایسه واحدها" data={charts.byUnit} />
			<BarCard title="کارهای دارای تاخیر" data={charts.delayedByEmployee} />
			{completed && (
				<Card className="col-span-12 lg:col-span-6">
					<CardHeader>
						<CardTitle>تکمیل‌شده در برابر تکمیل‌نشده</CardTitle>
					</CardHeader>
					<CardContent className="h-72">
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie data={completed} dataKey="count" nameKey="name" outerRadius={90} label>
									{completed.map((entry, index) => (
										<Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
									))}
								</Pie>
								<Legend />
								<Tooltip />
							</PieChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>
			)}
		</div>
	);
}

export { PerformanceCharts };
