"use client";

import moment from "moment-jalaali";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loading } from "@/ui/Loader";

import { FormQuestionType } from "@/formBuilder/enums/FormQuestionType";
import { adminAnswerFileDownloader } from "@/formBuilder/services/answerFiles";
import {
	OccurrenceAdminDetail,
	getOccurrenceDetailAsAdmin,
} from "@/formBuilder/services/getOccurrenceDetailAsAdmin";

import { QuestionResponseField } from "../../../../profile/forms/[assignmentId]/respond/[occurrenceId]/_components/QuestionResponseField";

function ViewOccurrenceAnswersDialog({
	payload,
	open,
	onClose,
}: {
	payload: { occurrenceId: string; title: string };
	open: boolean;
	onClose: () => Promise<void>;
}) {
	const [detail, setDetail] = useState<OccurrenceAdminDetail | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!open) return;
		setLoading(true);
		getOccurrenceDetailAsAdmin(payload.occurrenceId)
			.then(setDetail)
			.catch(() => toast.error("خطا در دریافت جزئیات نوبت."))
			.finally(() => setLoading(false));
	}, [open, payload.occurrenceId]);

	return (
		<Dialog open={open} onOpenChange={() => onClose()}>
			<DialogContent className="max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{payload.title}</DialogTitle>
				</DialogHeader>

				{loading || !detail ? (
					<Loading size="sm">در حال بارگزاری...</Loading>
				) : (
					<div className="flex flex-col gap-5">
						{detail.response ? (
							<>
								{[...(detail.version?.questions ?? [])]
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
													value={
														detail.response?.answers?.[question.id as string]
													}
													onChange={() => undefined}
													disabled
													download={adminAnswerFileDownloader(
														payload.occurrenceId,
													)}
												/>
											)}
										</div>
									))}

								<div className="flex flex-col gap-2 border-t pt-4">
									<span className="text-sm text-muted-foreground">
										تکمیل‌کننده: {detail.response.completerName} -{" "}
										{detail.response.signedAt
											? moment(detail.response.signedAt).format(
													"jYYYY/jMM/jDD HH:mm",
												)
											: ""}
									</span>
									{detail.response.signatureBase64 && (
										<img
											src={`data:image/png;base64,${detail.response.signatureBase64}`}
											alt="امضا"
											className="h-28 w-full max-w-sm rounded-lg border bg-white object-contain p-2"
										/>
									)}
								</div>
							</>
						) : (
							<p className="text-sm text-muted-foreground">
								هنوز پاسخی برای این نوبت ثبت نشده است.
							</p>
						)}
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}

export { ViewOccurrenceAnswersDialog };
