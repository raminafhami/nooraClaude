"use client";

import moment from "moment-jalaali";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Pagination from "@/components/ui/pagination/Pagination";
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
import { Loading } from "@/ui/Loader";
import { useTableData } from "@/cache/tableHook";
import downloadBlob from "@/utils/downloadBlob";

import {
	FORM_OCCURRENCE_STATUS_LABELS,
	FormOccurrenceStatus,
} from "@/formBuilder/enums/FormOccurrenceStatus";
import { FormReportMetrics, FormReportRow } from "@/formBuilder/models/FormReportRow";
import { downloadOccurrencePdfAsAdmin } from "@/formBuilder/services/downloadFormPdf";
import { getFormReport } from "@/formBuilder/services/getFormReport";
import { getFormReportMetrics } from "@/formBuilder/services/getFormReportMetrics";

interface ReportFilters {
	title?: string;
	code?: string;
	status?: FormOccurrenceStatus;
	overdue?: string;
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
	return (
		<Card>
			<CardContent className="flex flex-col items-center gap-1 p-4 text-center">
				<span className="text-xl font-bold">{value}</span>
				<span className="text-xs text-muted-foreground">{label}</span>
			</CardContent>
		</Card>
	);
}

function CompletedFormsReport() {
	const router = useRouter();
	const [rows, setRows] = useState<FormReportRow[]>([]);
	const [total, setTotal] = useState(0);
	const [metrics, setMetrics] = useState<FormReportMetrics | null>(null);
	const [loading, setLoading] = useState(false);

	const {
		currentPage,
		setCurrentPage,
		size,
		setSize,
		searchAttribute,
		setSearchAttribute,
	} = useTableData({
		tableName: "FormBuilderReportTable",
		initialPage: 0,
		initialSize: 10,
	});

	const filters = (searchAttribute as ReportFilters) ?? {};

	const load = useCallback(async () => {
		setLoading(true);
		try {
			const [reportResult, metricsResult] = await Promise.all([
				getFormReport({
					page: currentPage,
					size,
					title: filters.title,
					code: filters.code,
					status: filters.status,
					overdue: filters.overdue,
				}),
				getFormReportMetrics({
					title: filters.title,
					code: filters.code,
					status: filters.status,
					overdue: filters.overdue,
				}),
			]);
			setRows(reportResult.data);
			setTotal(reportResult.count);
			setMetrics(metricsResult);
		} catch {
			toast.error("خطا در دریافت گزارش.");
		} finally {
			setLoading(false);
		}
	}, [currentPage, size, filters.title, filters.code, filters.status, filters.overdue]);

	useEffect(() => {
		load();
	}, [load]);

	function handleViewAnswers(row: FormReportRow) {
		router.push(`/dashboard/procedure/forms/${row.formId}/occurrences/${row.id}`);
	}

	async function handleDownloadPdf(row: FormReportRow) {
		try {
			const blob = await downloadOccurrencePdfAsAdmin(row.id);
			downloadBlob({ blob, filename: `${row.form.code}-${row.id}.pdf` });
		} catch {
			toast.error("خطا در دانلود PDF.");
		}
	}

	return (
		<div className="flex flex-col gap-6">
			{metrics && (
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
					<MetricCard label="تعداد نوبت‌های مورد انتظار" value={metrics.expected} />
					<MetricCard label="تعداد تکمیل‌شده" value={metrics.completed} />
					<MetricCard label="تعداد تکمیل‌نشده" value={metrics.incomplete} />
					<MetricCard label="تعداد معوق" value={metrics.overdue} />
					<MetricCard
						label="درصد تکمیل به‌موقع"
						value={`${metrics.onTimeCompletionPercentage}%`}
					/>
				</div>
			)}

			<div className="flex flex-wrap items-center gap-2">
				<Input
					className="max-w-[220px]"
					placeholder="🔎︎ جست‌وجوی نام فرم"
					value={filters.title ?? ""}
					onChange={(e) =>
						setSearchAttribute((prev: any) => ({ ...prev, title: e.target.value }))
					}
				/>
				<Input
					className="max-w-[180px]"
					placeholder="🔎︎ کد فرم"
					value={filters.code ?? ""}
					onChange={(e) =>
						setSearchAttribute((prev: any) => ({ ...prev, code: e.target.value }))
					}
				/>
				<Select
					value={filters.status ?? "all"}
					onValueChange={(value) =>
						setSearchAttribute((prev: any) => ({
							...prev,
							status: value === "all" ? undefined : value,
						}))
					}
				>
					<SelectTrigger className="max-w-[180px]">
						<SelectValue placeholder="وضعیت" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">همه وضعیت‌ها</SelectItem>
						{Object.values(FormOccurrenceStatus).map((status) => (
							<SelectItem key={status} value={status}>
								{FORM_OCCURRENCE_STATUS_LABELS[status]}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Select
					value={filters.overdue ?? "all"}
					onValueChange={(value) =>
						setSearchAttribute((prev: any) => ({
							...prev,
							overdue: value === "all" ? undefined : value,
						}))
					}
				>
					<SelectTrigger className="max-w-[160px]">
						<SelectValue placeholder="تأخیر" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">همه</SelectItem>
						<SelectItem value="true">فقط معوق‌ها</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{loading ? (
				<Loading size="sm">در حال بارگزاری...</Loading>
			) : (
				<Table>
					<TableHeader>
						<TableRow className="bg-gray-100 text-right">
							<TableHead className="text-right">نام فرم</TableHead>
							<TableHead className="text-right">کد فرم</TableHead>
							<TableHead className="text-right">دسته‌بندی</TableHead>
							<TableHead className="text-right">نسخه</TableHead>
							<TableHead className="text-right">تکمیل‌کننده</TableHead>
							<TableHead className="text-right">دوره</TableHead>
							<TableHead className="text-right">سررسید</TableHead>
							<TableHead className="text-right">تاریخ ثبت نهایی</TableHead>
							<TableHead className="text-right">وضعیت</TableHead>
							<TableHead className="text-right"></TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{rows.length ? (
							rows.map((row) => (
								<TableRow key={row.id}>
									<TableCell>{row.form.title}</TableCell>
									<TableCell dir="ltr">{row.form.code}</TableCell>
									<TableCell>{row.form.category?.title ?? "-"}</TableCell>
									<TableCell>{row.version?.versionNo ?? "-"}</TableCell>
									<TableCell>
										{row.user ? `${row.user.name} ${row.user.lastname}` : "-"}
									</TableCell>
									<TableCell>{row.periodKey ?? "-"}</TableCell>
									<TableCell>
										{row.dueDate ? moment(row.dueDate).format("jYYYY/jMM/jDD") : "-"}
									</TableCell>
									<TableCell>
										{row.response?.submittedAt
											? moment(row.response.submittedAt).format("jYYYY/jMM/jDD")
											: "-"}
									</TableCell>
									<TableCell>
										<Badge
											variant={
												row.status === FormOccurrenceStatus.Completed
													? "default"
													: "secondary"
											}
										>
											{FORM_OCCURRENCE_STATUS_LABELS[row.status]}
										</Badge>
									</TableCell>
									<TableCell className="flex gap-1">
										<Button
											type="button"
											variant="ghost"
											size="sm"
											onClick={() => handleViewAnswers(row)}
										>
											مشاهده
										</Button>
										{row.status === FormOccurrenceStatus.Completed && (
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={() => handleDownloadPdf(row)}
											>
												PDF
											</Button>
										)}
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={10}>رکوردی یافت نشد.</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			)}

			<Pagination
				items={total}
				currentPage={currentPage}
				size={size}
				onPageChange={setCurrentPage}
				loading={loading}
				className="py-2"
				setSize={(value) => {
					setSize(value);
					setCurrentPage(0);
				}}
			/>
		</div>
	);
}

export { CompletedFormsReport };
