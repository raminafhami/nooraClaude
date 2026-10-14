"use client";

import moment from "moment-jalaali";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardIcon,
	CardTitle,
} from "@/components/ui/card";
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

import { FORM_ASSIGNMENT_FREQUENCY_LABELS } from "@/formBuilder/enums/FormAssignmentFrequency";
import { FormOccurrenceStatus, FORM_OCCURRENCE_STATUS_LABELS } from "@/formBuilder/enums/FormOccurrenceStatus";
import {
	downloadOccurrenceCompletedFormPdf,
	downloadOccurrenceRawFormPdf,
} from "@/formBuilder/services/downloadFormPdf";
import { ensureRespondableOccurrence } from "@/formBuilder/services/ensureRespondableOccurrence";
import {
	MyAssignmentDetail,
	getMyAssignmentDetail,
} from "@/formBuilder/services/getMyAssignmentDetail";
import downloadBlob from "@/utils/downloadBlob";

import { getFormCategoryIcon } from "../../../../procedure/_components/forms/_components/formCategoryIcons";

function AssignmentDetailPage({ assignmentId }: { assignmentId: string }) {
	const router = useRouter();
	const [detail, setDetail] = useState<MyAssignmentDetail | null>(null);
	const [loading, setLoading] = useState(true);
	const [starting, setStarting] = useState(false);

	const load = useCallback(async () => {
		setLoading(true);
		try {
			setDetail(await getMyAssignmentDetail(assignmentId));
		} catch {
			toast.error("خطا در دریافت اطلاعات فرم.");
		} finally {
			setLoading(false);
		}
	}, [assignmentId]);

	useEffect(() => {
		load();
	}, [load]);

	async function handleStart() {
		try {
			setStarting(true);
			const occurrence = await ensureRespondableOccurrence(assignmentId);
			router.push(
				`/dashboard/profile/forms/${assignmentId}/respond/${occurrence.id}`,
			);
		} catch (err: any) {
			toast.error(err?.message || "خطا در شروع تکمیل فرم.");
		} finally {
			setStarting(false);
		}
	}

	async function handleDownloadRawPdf(occurrenceId: string) {
		try {
			const blob = await downloadOccurrenceRawFormPdf(occurrenceId);
			downloadBlob({ blob, filename: `${detail?.form.code ?? "form"}.pdf` });
		} catch {
			toast.error("خطا در دانلود PDF فرم خام.");
		}
	}

	async function handleDownloadCompletedPdf(occurrenceId: string) {
		try {
			const blob = await downloadOccurrenceCompletedFormPdf(occurrenceId);
			downloadBlob({
				blob,
				filename: `${detail?.form.code ?? "form"}-${occurrenceId}.pdf`,
			});
		} catch {
			toast.error("خطا در دانلود PDF فرم تکمیل‌شده.");
		}
	}

	if (loading || !detail) {
		return (
			<Layout.Root>
				<Layout.Content>
					<Loading size="sm">در حال بارگزاری...</Loading>
				</Layout.Content>
			</Layout.Root>
		);
	}

	const { form, assignment, occurrences } = detail;
	const Icon = getFormCategoryIcon(form.category?.title);
	const openOccurrence = occurrences.find(
		(o) => o.status !== FormOccurrenceStatus.Completed,
	);

	return (
		<Layout.Root>
			<Layout.Head title={form.title}></Layout.Head>
			<Layout.Content>
				<div className="flex flex-col gap-6">
					<Card>
						<CardHeader orientation="horizontal" className="items-center">
							<CardIcon className="size-12">
								<Icon size={22} />
							</CardIcon>
							<div className="flex flex-col gap-1">
								<CardTitle>{form.title}</CardTitle>
								<span className="text-xs text-muted-foreground" dir="ltr">
									{form.code}
								</span>
							</div>
							<div className="xs:ms-auto">
								<Badge variant={assignment.isActive ? "default" : "outline"}>
									{assignment.isActive ? "فعال" : "غیرفعال"}
								</Badge>
							</div>
						</CardHeader>
						<CardContent className="flex flex-col gap-3">
							<div className="flex flex-wrap gap-6 text-sm">
								<span>
									<span className="text-muted-foreground">دسته‌بندی: </span>
									{form.category?.title ?? "-"}
								</span>
								<span>
									<span className="text-muted-foreground">تناوب: </span>
									{FORM_ASSIGNMENT_FREQUENCY_LABELS[assignment.frequency]}
								</span>
								{form.description && (
									<span>
										<span className="text-muted-foreground">توضیحات: </span>
										{form.description}
									</span>
								)}
							</div>

							<div className="flex flex-wrap gap-2 border-t pt-4">
								{assignment.isActive && (
									<Button type="button" disabled={starting} onClick={handleStart}>
										{openOccurrence ? "ادامه تکمیل فرم" : "تکمیل فرم جدید"}
									</Button>
								)}
								{occurrences.length > 0 && (
									<Button
										type="button"
										variant="outline"
										onClick={() => handleDownloadRawPdf(occurrences[0].id)}
									>
										دانلود فرم خام
									</Button>
								)}
							</div>
						</CardContent>
					</Card>

					<div>
						<h3 className="mb-3 text-sm text-muted-foreground">تاریخچه تکمیل</h3>
						<Table>
							<TableHeader>
								<TableRow className="bg-gray-100 text-right">
									<TableHead className="text-right">دوره</TableHead>
									<TableHead className="text-right">سررسید</TableHead>
									<TableHead className="text-right">وضعیت</TableHead>
									<TableHead className="text-right"></TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{occurrences.length ? (
									occurrences.map((occurrence) => (
										<TableRow key={occurrence.id}>
											<TableCell>{occurrence.periodKey ?? "-"}</TableCell>
											<TableCell>
												{occurrence.dueDate
													? moment(occurrence.dueDate).format("jYYYY/jMM/jDD")
													: "-"}
											</TableCell>
											<TableCell>
												{FORM_OCCURRENCE_STATUS_LABELS[occurrence.status]}
											</TableCell>
											<TableCell>
												{occurrence.status !== FormOccurrenceStatus.Completed ? (
													<Button
														type="button"
														variant="ghost"
														size="sm"
														onClick={() =>
															router.push(
																`/dashboard/profile/forms/${assignmentId}/respond/${occurrence.id}`,
															)
														}
													>
														ادامه
													</Button>
												) : (
													<Button
														type="button"
														variant="ghost"
														size="sm"
														onClick={() => handleDownloadCompletedPdf(occurrence.id)}
													>
														دانلود PDF
													</Button>
												)}
											</TableCell>
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell colSpan={4}>نوبتی ثبت نشده است.</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>
				</div>
			</Layout.Content>
		</Layout.Root>
	);
}

export { AssignmentDetailPage };
