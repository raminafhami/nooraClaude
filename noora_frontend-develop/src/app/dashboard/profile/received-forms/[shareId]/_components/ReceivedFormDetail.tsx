"use client";

import moment from "moment-jalaali";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loading } from "@/ui/Loader";
import { Layout } from "@/ui/Layout";

import { FormQuestionType } from "@/formBuilder/enums/FormQuestionType";
import { sharedAnswerFileDownloader } from "@/formBuilder/services/answerFiles";
import { downloadSharedFormPdf } from "@/formBuilder/services/downloadSharedFormPdf";
import { ShareDetail, getShareDetail } from "@/formBuilder/services/getShareDetail";
import downloadBlob from "@/utils/downloadBlob";

import { QuestionResponseField } from "../../../forms/[assignmentId]/respond/[occurrenceId]/_components/QuestionResponseField";

function ReceivedFormDetail({ shareId }: { shareId: string }) {
	const [detail, setDetail] = useState<ShareDetail | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getShareDetail(shareId)
			.then(setDetail)
			.catch(() => toast.error("خطا در دریافت فرم ارسالی."))
			.finally(() => setLoading(false));
	}, [shareId]);

	async function handleDownload() {
		try {
			const blob = await downloadSharedFormPdf(shareId);
			downloadBlob({ blob, filename: `${detail?.form.code ?? "form"}.pdf` });
		} catch {
			toast.error("خطا در دانلود PDF.");
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

	const { form, version, response, share } = detail;
	const answers = response.answers ?? {};

	return (
		<Layout.Root>
			<Layout.Head title={form.title}></Layout.Head>
			<Layout.Content>
				<div className="flex flex-col gap-5">
					<div className="text-sm text-muted-foreground">
						ارسال‌کننده: {share.sender?.name} {share.sender?.lastname}
						{share.message ? ` - ${share.message}` : ""}
					</div>

					{[...version.questions]
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
										download={sharedAnswerFileDownloader(shareId)}
									/>
								)}
							</div>
						))}

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
				</div>
			</Layout.Content>
		</Layout.Root>
	);
}

export { ReceivedFormDetail };
