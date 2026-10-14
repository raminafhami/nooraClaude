"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardIcon,
	CardTitle,
} from "@/components/ui/card";
import { useDialogs } from "@/components/ui/dialog/use-dialogs";
import { Loading } from "@/ui/Loader";
import { Layout } from "@/ui/Layout";

import { FormStatus } from "@/formBuilder/enums/FormStatus";
import { Form } from "@/formBuilder/models/Form";
import { FormVersion } from "@/formBuilder/models/FormVersion";
import { archiveForm } from "@/formBuilder/services/archiveForm";
import { createNewFormVersion } from "@/formBuilder/services/createNewFormVersion";
import { downloadRawFormPdf } from "@/formBuilder/services/downloadFormPdf";
import { getFormById } from "@/formBuilder/services/getFormById";
import { getFormVersion } from "@/formBuilder/services/getFormVersion";
import { publishForm } from "@/formBuilder/services/publishForm";
import downloadBlob from "@/utils/downloadBlob";

import { AssignFormDialog } from "./AssignFormDialog";
import { AssignmentsList } from "./AssignmentsList";
import { EditFormMetaDialog } from "./EditFormMetaDialog";
import { FormPreviewDialog } from "./FormPreviewDialog";
import { getFormCategoryIcon } from "../../../_components/forms/_components/formCategoryIcons";
import { FormStatusBadge } from "../../../_components/forms/_components/FormStatusBadge";
import { QuestionBuilder } from "./QuestionBuilder";
import { VersionsList } from "./VersionsList";

function FormDetailPage({ formId }: { formId: string }) {
	const dialogs = useDialogs();
	const [form, setForm] = useState<Form | null>(null);
	const [draftVersion, setDraftVersion] = useState<FormVersion | null>(null);
	// The Form.publishedVersion virtual is deliberately lightweight (no
	// `questions`) so the forms list stays cheap - preview needs the full
	// content, so it's fetched separately whenever there's no open draft.
	const [publishedVersion, setPublishedVersion] = useState<FormVersion | null>(
		null,
	);
	const [loading, setLoading] = useState(true);
	const [actionLoading, setActionLoading] = useState(false);
	const [versionsKey, setVersionsKey] = useState(0);
	const [assignmentsKey, setAssignmentsKey] = useState(0);

	const load = useCallback(async () => {
		setLoading(true);
		try {
			const loadedForm = await getFormById(formId);
			setForm(loadedForm);

			if (loadedForm.draftVersionId) {
				const version = await getFormVersion(
					formId,
					loadedForm.draftVersionId,
				);
				setDraftVersion(version);
			} else {
				setDraftVersion(null);
			}

			if (loadedForm.publishedVersionId) {
				const version = await getFormVersion(
					formId,
					loadedForm.publishedVersionId,
				);
				setPublishedVersion(version);
			} else {
				setPublishedVersion(null);
			}
		} catch {
			toast.error("خطا در دریافت اطلاعات فرم.");
		} finally {
			setLoading(false);
		}
	}, [formId]);

	useEffect(() => {
		load();
	}, [load]);

	async function handleEditMeta() {
		if (!form) return;
		const result = await dialogs.open(EditFormMetaDialog, form);
		if (result) {
			setForm(result);
		}
	}

	async function handlePreview() {
		if (!form) return;
		const questions = draftVersion?.questions ?? publishedVersion?.questions ?? [];
		await dialogs.open(FormPreviewDialog, { title: form.title, questions });
	}

	async function handlePublish() {
		if (!form) return;
		try {
			setActionLoading(true);
			await publishForm(form.id);
			await load();
			setVersionsKey((k) => k + 1);
			toast.success("فرم با موفقیت منتشر شد.");
		} catch (err: any) {
			toast.error(err?.message || "خطا در انتشار فرم.");
		} finally {
			setActionLoading(false);
		}
	}

	async function handleNewVersion() {
		if (!form) return;
		try {
			setActionLoading(true);
			await createNewFormVersion(form.id);
			await load();
			toast.success("نسخه جدید ایجاد شد.");
		} catch (err: any) {
			toast.error(err?.message || "خطا در ایجاد نسخه جدید.");
		} finally {
			setActionLoading(false);
		}
	}

	async function handleAssign() {
		if (!form) return;
		const result = await dialogs.open(AssignFormDialog, { formId: form.id });
		if (result?.some((r) => r.success)) {
			setAssignmentsKey((k) => k + 1);
		}
	}

	async function handleDownloadRawPdf() {
		if (!form) return;
		try {
			const blob = await downloadRawFormPdf(form.id);
			downloadBlob({ blob, filename: `${form.code}.pdf` });
		} catch {
			toast.error("خطا در دانلود PDF فرم.");
		}
	}

	async function handleArchive() {
		if (!form) return;
		if (!window.confirm("از بایگانی کردن این فرم مطمئن هستید؟")) return;
		try {
			setActionLoading(true);
			const updated = await archiveForm(form.id);
			setForm(updated);
			toast.success("فرم بایگانی شد.");
		} catch (err: any) {
			toast.error(err?.message || "خطا در بایگانی فرم.");
		} finally {
			setActionLoading(false);
		}
	}

	if (loading || !form) {
		return (
			<Layout.Root>
				<Layout.Content>
					<Loading size="sm">در حال بارگزاری...</Loading>
				</Layout.Content>
			</Layout.Root>
		);
	}

	const Icon = getFormCategoryIcon(form.category?.title);
	const canEdit = form.status !== FormStatus.Archived;
	const canPublish = Boolean(draftVersion && draftVersion.questions.length);
	const canCreateNewVersion =
		form.status === FormStatus.Published && !form.draftVersionId;

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
							<div className="flex items-center gap-2 xs:ms-auto">
								<FormStatusBadge status={form.status} />
							</div>
						</CardHeader>
						<CardContent className="flex flex-col gap-3">
							<div className="flex flex-wrap gap-6 text-sm">
								<span>
									<span className="text-muted-foreground">دسته‌بندی: </span>
									{form.category?.title ?? "-"}
								</span>
								{form.description && (
									<span>
										<span className="text-muted-foreground">توضیحات: </span>
										{form.description}
									</span>
								)}
							</div>

							<div className="flex flex-wrap gap-2 border-t pt-4">
								{canEdit && (
									<Button
										type="button"
										variant="secondary"
										onClick={handleEditMeta}
									>
										ویرایش مشخصات
									</Button>
								)}
								<Button type="button" variant="outline" onClick={handlePreview}>
									پیش‌نمایش
								</Button>
								<Button
									type="button"
									variant="outline"
									onClick={handleDownloadRawPdf}
								>
									دانلود PDF خام
								</Button>
								{canPublish && (
									<Button
										type="button"
										disabled={actionLoading}
										onClick={handlePublish}
									>
										انتشار فرم
									</Button>
								)}
								{canCreateNewVersion && (
									<Button
										type="button"
										disabled={actionLoading}
										onClick={handleNewVersion}
									>
										ایجاد نسخه جدید
									</Button>
								)}
								{form.status === FormStatus.Published && (
									<Button type="button" onClick={handleAssign}>
										تخصیص به پرسنل
									</Button>
								)}
								{canEdit && (
									<Button
										type="button"
										variant="destructive"
										disabled={actionLoading}
										onClick={handleArchive}
									>
										بایگانی فرم
									</Button>
								)}
							</div>
						</CardContent>
					</Card>

					{draftVersion ? (
						<div>
							<h3 className="mb-3 text-sm text-muted-foreground">
								طراحی سوالات (نسخه {draftVersion.versionNo} - پیش‌نویس)
							</h3>
							<QuestionBuilder
								formId={form.id}
								draftVersion={draftVersion}
								onSaved={load}
							/>
						</div>
					) : (
						<div className="rounded-xl bg-gray-50 p-4 text-sm text-muted-foreground">
							این فرم پیش‌نویس باز ندارد. برای ویرایش ساختار سوالات، یک نسخه
							جدید ایجاد کنید.
						</div>
					)}

					<div>
						<h3 className="mb-3 text-sm text-muted-foreground">نسخه‌ها</h3>
						<VersionsList formId={form.id} refreshKey={versionsKey} />
					</div>

					{form.status === FormStatus.Published && (
						<div>
							<h3 className="mb-3 text-sm text-muted-foreground">
								تخصیص‌ها
							</h3>
							<AssignmentsList formId={form.id} refreshKey={assignmentsKey} />
						</div>
					)}
				</div>
			</Layout.Content>
		</Layout.Root>
	);
}

export { FormDetailPage };
