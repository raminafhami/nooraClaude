"use client";

import moment from "moment-jalaali";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Pagination from "@/components/ui/pagination/Pagination";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Loading } from "@/ui/Loader";
import { Layout } from "@/ui/Layout";
import downloadBlob from "@/utils/downloadBlob";

import { FORM_ASSIGNMENT_FREQUENCY_LABELS } from "@/formBuilder/enums/FormAssignmentFrequency";
import {
	FORM_OCCURRENCE_STATUS_LABELS,
	FormOccurrenceStatus,
} from "@/formBuilder/enums/FormOccurrenceStatus";
import { Form } from "@/formBuilder/models/Form";
import { FormAssignment } from "@/formBuilder/models/FormAssignment";
import { FormReportRow } from "@/formBuilder/models/FormReportRow";
import { downloadOccurrencePdfAsAdmin } from "@/formBuilder/services/downloadFormPdf";
import { getFormAssignments } from "@/formBuilder/services/getFormAssignments";
import { getFormById } from "@/formBuilder/services/getFormById";
import { getFormReport } from "@/formBuilder/services/getFormReport";

// One employee's history on one form, for managers: every assignment they
// had (active or not) and every occurrence they filled or started.
function UserFormHistoryPage({ formId, userId }: { formId: string; userId: string }) {
	const router = useRouter();
	const [form, setForm] = useState<Form | null>(null);
	const [assignments, setAssignments] = useState<FormAssignment[]>([]);
	const [rows, setRows] = useState<FormReportRow[]>([]);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(0);
	const [size, setSize] = useState(10);
	const [loading, setLoading] = useState(true);
	const [rowsLoading, setRowsLoading] = useState(false);

	useEffect(() => {
		setLoading(true);
		Promise.all([getFormById(formId), getFormAssignments(formId)])
			.then(([loadedForm, allAssignments]) => {
				setForm(loadedForm);
				setAssignments(allAssignments.filter((a) => a.userId === userId));
			})
			.catch(() => toast.error("خطا در دریافت اطلاعات فرم."))
			.finally(() => setLoading(false));
	}, [formId, userId]);

	const loadRows = useCallback(async () => {
		setRowsLoading(true);
		try {
			const result = await getFormReport({ page, size, formId, userId });
			setRows(result.data);
			setTotal(result.count);
		} catch {
			toast.error("خطا در دریافت فرم‌های تکمیل‌شده.");
		} finally {
			setRowsLoading(false);
		}
	}, [page, size, formId, userId]);

	useEffect(() => {
		loadRows();
	}, [loadRows]);

	async function handleDownloadPdf(row: FormReportRow) {
		try {
			const blob = await downloadOccurrencePdfAsAdmin(row.id);
			downloadBlob({ blob, filename: `${row.form.code}-${row.id}.pdf` });
		} catch {
			toast.error("خطا در دانلود PDF.");
		}
	}

	if (loading) {
		return (
			<Layout.Root>
				<Layout.Content>
					<Loading size="sm">در حال بارگزاری...</Loading>
				</Layout.Content>
			</Layout.Root>
		);
	}

	const user = assignments.find((a) => a.user)?.user;
	const userName = user ? `${user.name} ${user.lastname}` : "پرسنل";

	return (
		<Layout.Root>
			<Layout.Head title={`${form?.title ?? "فرم"} - ${userName}`}></Layout.Head>
			<Layout.Content>
				<div className="flex flex-col gap-6">
					{form?.code && (
						<span className="text-xs text-muted-foreground" dir="ltr">
							{form.code}
						</span>
					)}

					<div>
						<h3 className="mb-3 text-sm text-muted-foreground">سابقه تخصیص</h3>
						<Table>
							<TableHeader>
								<TableRow className="bg-gray-100 text-right">
									<TableHead className="text-right">تاریخ تخصیص</TableHead>
									<TableHead className="text-right">برنامه تکمیل</TableHead>
									<TableHead className="text-right">تاریخ شروع</TableHead>
									<TableHead className="text-right">تاریخ پایان</TableHead>
									<TableHead className="text-right">وضعیت</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{assignments.length ? (
									assignments.map((assignment) => (
										<TableRow key={assignment.id}>
											<TableCell>
												{moment(assignment.createdAt).format("jYYYY/jMM/jDD HH:mm")}
											</TableCell>
											<TableCell>
												{FORM_ASSIGNMENT_FREQUENCY_LABELS[assignment.frequency]}
											</TableCell>
											<TableCell>
												{moment(assignment.startDate).format("jYYYY/jMM/jDD")}
											</TableCell>
											<TableCell>
												{assignment.endDate
													? moment(assignment.endDate).format("jYYYY/jMM/jDD")
													: "-"}
											</TableCell>
											<TableCell>
												<Badge variant={assignment.isActive ? "default" : "outline"}>
													{assignment.isActive ? "فعال" : "غیرفعال"}
												</Badge>
											</TableCell>
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell colSpan={5}>تخصیصی ثبت نشده است.</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>

					<div>
						<h3 className="mb-3 text-sm text-muted-foreground">فرم‌های تکمیل‌شده</h3>
						{rowsLoading ? (
							<Loading size="sm">در حال بارگزاری...</Loading>
						) : (
							<Table>
								<TableHeader>
									<TableRow className="bg-gray-100 text-right">
										<TableHead className="text-right">تاریخ ایجاد</TableHead>
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
												<TableCell>
													{moment(row.createdAt).format("jYYYY/jMM/jDD HH:mm")}
												</TableCell>
												<TableCell dir="ltr" className="text-right">
													{row.periodKey && row.periodKey !== "once"
														? row.periodKey
														: "-"}
												</TableCell>
												<TableCell>
													{row.dueDate
														? moment(row.dueDate).format("jYYYY/jMM/jDD")
														: "-"}
												</TableCell>
												<TableCell>
													{row.response?.submittedAt
														? moment(row.response.submittedAt).format(
																"jYYYY/jMM/jDD HH:mm",
															)
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
														onClick={() =>
															router.push(
																`/dashboard/procedure/forms/${formId}/occurrences/${row.id}`,
															)
														}
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
											<TableCell colSpan={6}>
												هنوز فرمی توسط این پرسنل ثبت نشده است.
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						)}

						<Pagination
							items={total}
							currentPage={page}
							size={size}
							onPageChange={setPage}
							loading={rowsLoading}
							className="py-2"
							setSize={(value) => {
								setSize(value);
								setPage(0);
							}}
						/>
					</div>
				</div>
			</Layout.Content>
		</Layout.Root>
	);
}

export { UserFormHistoryPage };
