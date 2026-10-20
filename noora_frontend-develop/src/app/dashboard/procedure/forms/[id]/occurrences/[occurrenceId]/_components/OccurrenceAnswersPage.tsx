"use client";

import moment from "moment-jalaali";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loading } from "@/ui/Loader";
import { Layout } from "@/ui/Layout";

import {
	FORM_OCCURRENCE_STATUS_LABELS,
	FormOccurrenceStatus,
} from "@/formBuilder/enums/FormOccurrenceStatus";
import { FormQuestionType } from "@/formBuilder/enums/FormQuestionType";
import { adminAnswerFileDownloader } from "@/formBuilder/services/answerFiles";
import { downloadOccurrencePdfAsAdmin } from "@/formBuilder/services/downloadFormPdf";
import {
	OccurrenceAdminDetail,
	getOccurrenceDetailAsAdmin,
} from "@/formBuilder/services/getOccurrenceDetailAsAdmin";
import downloadBlob from "@/utils/downloadBlob";

import { QuestionResponseField } from "../../../../../../profile/forms/[assignmentId]/respond/[occurrenceId]/_components/QuestionResponseField";

// Manager's read-only view of one filled form - same layout as a form
// received via share (questions with answers, completer, signature, PDF).
function OccurrenceAnswersPage({ occurrenceId }: { occurrenceId: string }) {
	const [detail, setDetail] = useState<OccurrenceAdminDetail | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		setLoading(true);
		getOccurrenceDetailAsAdmin(occurrenceId)
			.then(setDetail)
			.catch(() => toast.error("خطا در دریافت فرم تکمیل‌شده."))
			.finally(() => setLoading(false));
	}, [occurrenceId]);

	async function handleDownload() {
		try {
			const blob = await downloadOccurrencePdfAsAdmin(occurrenceId);
			downloadBlob({
				blob,
				filename: `${detail?.form?.code ?? "form"}-${occurrenceId}.pdf`,
			});
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

	if (!detail) {
		return (
			<Layout.Root>
				<Layout.Head title="فرم تکمیل‌شده"></Layout.Head>
				<Layout.Content>
					<p className="text-sm text-muted-foreground">فرم مورد نظر یافت نشد.</p>
				</Layout.Content>
			</Layout.Root>
		);
	}

	const { form, version, response, occurrence, user } = detail;
	const answers = response?.answers ?? {};
	const isCompleted = occurrence.status === FormOccurrenceStatus.Completed;

	return (
		<Layout.Root>
			<Layout.Head title={form?.title ?? "فرم تکمیل‌شده"}></Layout.Head>
			<Layout.Content>
				<div className="flex flex-col gap-5">
					<div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
						{form?.code && <span dir="ltr">{form.code}</span>}
						<span>
							پرسنل: {user ? `${user.name} ${user.lastname}` : "-"}
						</span>
						{occurrence.periodKey && occurrence.periodKey !== "once" && (
							<span>دوره: {occurrence.periodKey}</span>
						)}
						<span>وضعیت: {FORM_OCCURRENCE_STATUS_LABELS[occurrence.status]}</span>
					</div>

					{response && version ? (
						[...version.questions]
							.sort((a, b) => a.order - b.order)
							.map((question, index) => (
								<div key={index} className="flex flex-col gap-2">
									{question.type !== FormQuestionType.StaticText && (
										<Label>
											{index + 1}. {question.title}
										</Label>
									)}
									{question.type === FormQuestionType.StaticText ? (
										<p className="rounded-xl bg-gray-50 p-3 text-sm text-muted-foreground">
											{question.description || question.title}
										</p>
									) : (
										<QuestionResponseField
											question={question}
											value={answers[question.id as string]}
											onChange={() => undefined}
											disabled
											download={adminAnswerFileDownloader(occurrenceId)}
										/>
									)}
								</div>
							))
					) : (
						<p className="text-sm text-muted-foreground">
							هنوز پاسخی برای این فرم ثبت نشده است.
						</p>
					)}

					{isCompleted && response && (
						<div className="flex flex-col gap-2 border-t pt-4">
							<span className="text-sm text-muted-foreground">
								تکمیل‌کننده: {response.completerName} -{" "}
								{response.signedAt
									? moment(response.signedAt).format("jYYYY/jMM/jDD HH:mm")
									: ""}
							</span>
							{response.signatureBase64 && (
								<img
									src={`data:image/png;base64,${response.signatureBase64}`}
									alt="امضا"
									className="h-28 w-full max-w-sm rounded-lg border bg-white object-contain p-2"
								/>
							)}
							<Button
								type="button"
								variant="outline"
								className="w-fit"
								onClick={handleDownload}
							>
								دانلود PDF
							</Button>
						</div>
					)}
				</div>
			</Layout.Content>
		</Layout.Root>
	);
}

export { OccurrenceAnswersPage };
