"use client";

import moment from "jalali-moment";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/ui/date-input";
import { Label } from "@/components/ui/label";
import {
	DayReport,
	getPerformanceCharts,
	getPerformanceFilters,
	getPersonnelDay,
	getPersonnelReports,
	PerformanceCharts as ChartsData,
} from "@/features/performance-report/api";
import { ActivityRowsTable } from "@/features/performance-report/ActivityRowsTable";
import { Panel } from "@/ui/Panel";
import { Table } from "@/ui/Table";
import { Loading } from "@/ui/Loader";

import { PerformanceCharts } from "./PerformanceCharts";

function PerformanceTab() {
	const params = useSearchParams();
	const [date, setDate] = useState(moment().format("jYYYY/jMM/jDD"));
	const [range, setRange] = useState<"day" | "week" | "month">("day");
	const [unitId, setUnitId] = useState("");
	const [userId, setUserId] = useState("");
	const [activityTypeId, setActivityTypeId] = useState("");
	const [origin, setOrigin] = useState("");
	const [sourceModule, setSourceModule] = useState("");
	const [filters, setFilters] = useState<Awaited<
		ReturnType<typeof getPerformanceFilters>
	> | null>(null);
	const [list, setList] = useState<Awaited<ReturnType<typeof getPersonnelReports>> | null>(
		null,
	);
	const [day, setDay] = useState<DayReport | null>(null);
	const [charts, setCharts] = useState<ChartsData | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const queryUser = params.get("userId");
		const queryDate = params.get("date");
		if (queryUser) setUserId(queryUser);
		if (queryDate && /^\d{4}-\d{2}-\d{2}$/.test(queryDate)) {
			setDate(moment(queryDate, "YYYY-MM-DD").format("jYYYY/jMM/jDD"));
		}
	}, [params]);

	useEffect(() => {
		getPerformanceFilters()
			.then(setFilters)
			.catch((error: any) => toast.error(error?.message || "فیلترها دریافت نشد"));
	}, []);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			setLoading(true);
			try {
				const search: Record<string, string> = { date, range };
				if (unitId) search.unitId = unitId;
				if (userId) search.userId = userId;
				if (activityTypeId) search.activityTypeId = activityTypeId;
				if (origin) search.origin = origin;
				if (sourceModule) search.sourceModule = sourceModule;
				const [people, chartData] = await Promise.all([
					getPersonnelReports(date),
					getPerformanceCharts(search),
				]);
				if (cancelled) return;
				setList(people);
				setCharts(chartData);
				if (userId) setDay(await getPersonnelDay(userId, date));
				else setDay(null);
			} catch (error: any) {
				if (!cancelled) toast.error(error?.message || "گزارش عملکرد دریافت نشد");
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [date, range, unitId, userId, activityTypeId, origin, sourceModule]);

	return (
		<div className="space-y-4">
			<div className="grid gap-3 md:grid-cols-3">
				<div>
					<Label>تاریخ</Label>
					<DateInput
						value={date}
						onChange={(value) => {
							if (typeof value === "string" && value) setDate(value.split(" ")[0]);
						}}
					/>
				</div>
				<Select
					label="بازه"
					value={range}
					onChange={(value) => setRange(value as "day" | "week" | "month")}
					options={[
						{ id: "day", title: "روز" },
						{ id: "week", title: "هفته" },
						{ id: "month", title: "ماه" },
					]}
				/>
				<Select
					label="واحد سازمانی"
					value={unitId}
					onChange={setUnitId}
					options={[{ id: "", title: "همه" }, ...(filters?.units || [])]}
				/>
				<Select
					label="کارمند"
					value={userId}
					onChange={setUserId}
					options={[
						{ id: "", title: "همه" },
						...(filters?.employees || []).map((item) => ({
							id: item.id,
							title: item.fullName,
						})),
					]}
				/>
				<Select
					label="نوع فعالیت"
					value={activityTypeId}
					onChange={setActivityTypeId}
					options={[{ id: "", title: "همه" }, ...(filters?.activityTypes || [])]}
				/>
				<Select
					label="مبدأ"
					value={origin}
					onChange={setOrigin}
					options={[{ id: "", title: "همه" }, ...(filters?.origins || [])]}
				/>
				<Select
					label="ماژول"
					value={sourceModule}
					onChange={setSourceModule}
					options={[{ id: "", title: "همه" }, ...(filters?.sourceModules || [])]}
				/>
			</div>

			{list && <p className="text-sm text-muted-foreground">{list.note}</p>}

			{loading ? (
				<Loading size="sm">در حال دریافت اطلاعات...</Loading>
			) : (
				<Panel.Root>
					<Table.Root>
						<Table.Head>
							<Table.Row className="bg-gray-100 text-right">
								<Table.Cell as="th">نام</Table.Cell>
								<Table.Cell as="th">واحد</Table.Cell>
								<Table.Cell as="th">تاریخ</Table.Cell>
								<Table.Cell as="th">کل</Table.Cell>
								<Table.Cell as="th">سیستمی</Table.Cell>
								<Table.Cell as="th">دستی</Table.Cell>
								<Table.Cell as="th">تکمیل‌شده</Table.Cell>
								<Table.Cell as="th">تکمیل‌نشده</Table.Cell>
								{list?.showDelayed && <Table.Cell as="th">تاخیر</Table.Cell>}
								<Table.Cell as="th">وضعیت گزارش</Table.Cell>
							</Table.Row>
						</Table.Head>
						<Table.Body>
							{(list?.rows || []).map((row) => (
								<Table.Row
									key={row.userId}
									className="cursor-pointer"
									onClick={() => setUserId(row.userId)}
								>
									<Table.Cell>{row.fullName}</Table.Cell>
									<Table.Cell>{row.organizationalUnitTitle}</Table.Cell>
									<Table.Cell>{row.dateLabel}</Table.Cell>
									<Table.Cell>{row.total}</Table.Cell>
									<Table.Cell>{row.system}</Table.Cell>
									<Table.Cell>{row.manual}</Table.Cell>
									<Table.Cell>{row.completed}</Table.Cell>
									<Table.Cell>{row.incomplete}</Table.Cell>
									{list?.showDelayed && (
										<Table.Cell>
											{row.delayedTasks === null ? "-" : row.delayedTasks}
										</Table.Cell>
									)}
									<Table.Cell>{row.reportStatusLabel}</Table.Cell>
								</Table.Row>
							))}
						</Table.Body>
					</Table.Root>
				</Panel.Root>
			)}

			{day && (
				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium">
							{day.fullName} — {day.dateLabel} — {day.reportStatusLabel}
						</h3>
						<Button type="button" variant="secondary" onClick={() => setUserId("")}>
							بازگشت به فهرست
						</Button>
					</div>
					<ActivityRowsTable rows={day.rows} />
					{day.reportChangeHistory?.length ? (
						<p className="text-xs text-muted-foreground">
							تاریخچه تغییرات پس از ارسال:{" "}
							{day.reportChangeHistory.map((item) => item.summary).join(" | ")}
						</p>
					) : null}
				</div>
			)}

			<PerformanceCharts charts={charts} />
		</div>
	);
}

function Select({
	label,
	value,
	onChange,
	options,
}: {
	label: string;
	value: string;
	onChange: (value: string) => void;
	options: { id: string; title: string }[];
}) {
	return (
		<div>
			<Label>{label}</Label>
			<select
				className="h-10 w-full rounded-xl border px-3"
				value={value}
				onChange={(event) => onChange(event.target.value)}
			>
				{options.map((option) => (
					<option key={option.id || option.title} value={option.id}>
						{option.title}
					</option>
				))}
			</select>
		</div>
	);
}

export { PerformanceTab };
