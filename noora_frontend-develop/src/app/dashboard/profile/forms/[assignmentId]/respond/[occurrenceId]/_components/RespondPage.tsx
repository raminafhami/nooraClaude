"use client";

import moment from "moment-jalaali";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useDialogs } from "@/components/ui/dialog/use-dialogs";
import { Label } from "@/components/ui/label";
import { Loading } from "@/ui/Loader";
import { Layout } from "@/ui/Layout";

import { FormQuestionType } from "@/formBuilder/enums/FormQuestionType";
import { FormQuestion } from "@/formBuilder/models/FormQuestion";
import { FormResponse } from "@/formBuilder/models/FormResponse";
import { downloadOccurrenceCompletedFormPdf } from "@/formBuilder/services/downloadFormPdf";
import { finalizeOccurrenceResponse } from "@/formBuilder/services/finalizeOccurrenceResponse";
import { getOccurrenceResponse } from "@/formBuilder/services/getOccurrenceResponse";
import { getOccurrenceVersion } from "@/formBuilder/services/getOccurrenceVersion";
import { saveOccurrenceAnswers } from "@/formBuilder/services/saveOccurrenceAnswers";
import downloadBlob from "@/utils/downloadBlob";

import { QuestionResponseField } from "./QuestionResponseField";
import { ShareFormDialog } from "./ShareFormDialog";

type SaveState = "idle" | "saving" | "saved" | "error";

const SAVE_STATE_LABEL: Record<SaveState, string> = {
	idle: "",
	saving: "در حال ذخیره...",
	saved: "ذخیره شد",
	error: "خطا در ذخیره",
};

function RespondPage({ occurrenceId }: { occurrenceId: string }) {
	const dialogs = useDialogs();
	const [title, setTitle] = useState("");
	const [questions, setQuestions] = useState<FormQuestion[]>([]);
	const [answers, setAnswers] = useState<Record<string, unknown>>({});
	const [revision, setRevision] = useState(0);
	const [response, setResponse] = useState<FormResponse | null>(null);
	const [loading, setLoading] = useState(true);
	const [saveState, setSaveState] = useState<SaveState>("idle");
	const [finalizing, setFinalizing] = useState(false);

	const revisionRef = useRef(revision);
	revisionRef.current = revision;
	const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
	const answersRef = useRef(answers);
	answersRef.current = answers;
	// Saves are chained so only one request is in flight and each one carries
	// the revision returned by the previous one; `pendingAnswersRef` always
	// holds the newest unsaved answers (an older in-flight save never wins).
	const saveChainRef = useRef<Promise<boolean>>(Promise.resolve(true));
	const pendingAnswersRef = useRef<Record<string, unknown> | null>(null);
	const dirtyRef = useRef(false);

	const isCompleted = response?.status === "completed";

	const load = useCallback(async () => {
		setLoading(true);
		try {
			const { version, form } = await getOccurrenceVersion(occurrenceId);
			setQuestions([...version.questions].sort((a, b) => a.order - b.order));
			if (form) setTitle(form.title);

			const loadedResponse = await getOccurrenceResponse(occurrenceId);
			if (loadedResponse) {
				setAnswers(loadedResponse.answers ?? {});
				setRevision(loadedResponse.revision);
				setResponse(loadedResponse);
			}
		} catch {
			toast.error("خطا در دریافت فرم.");
		} finally {
			setLoading(false);
		}
	}, [occurrenceId]);

	useEffect(() => {
		load();
	}, [load]);

	const persist = useCallback(
		(nextAnswers: Record<string, unknown>): Promise<boolean> => {
			pendingAnswersRef.current = nextAnswers;

			const run = async (): Promise<boolean> => {
				const toSave = pendingAnswersRef.current;
				if (!toSave) return true;
				pendingAnswersRef.current = null;

				setSaveState("saving");
				try {
					const saved = await saveOccurrenceAnswers(
						occurrenceId,
						toSave,
						revisionRef.current,
					);
					revisionRef.current = saved.revision;
					setRevision(saved.revision);
					if (!pendingAnswersRef.current) {
						dirtyRef.current = false;
						setSaveState("saved");
					}
					return true;
				} catch (err: any) {
					// Keep the answers for the next attempt unless newer ones exist.
					pendingAnswersRef.current ??= toSave;
					setSaveState("error");
					toast.error(err?.message || "خطا در ذخیره پاسخ‌ها.");
					return false;
				}
			};

			saveChainRef.current = saveChainRef.current.then(run);
			return saveChainRef.current;
		},
		[occurrenceId],
	);

	function updateAnswer(questionId: string, value: unknown) {
		if (isCompleted) return;
		const next = { ...answers, [questionId]: value };
		setAnswers(next);
		dirtyRef.current = true;

		if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
		saveTimeoutRef.current = setTimeout(() => {
			saveTimeoutRef.current = undefined;
			persist(next);
		}, 1000);
	}

	useEffect(() => {
		// Warn before closing/reloading the tab with unsaved answers.
		const onBeforeUnload = (event: BeforeUnloadEvent) => {
			if (dirtyRef.current) {
				event.preventDefault();
				event.returnValue = "";
			}
		};
		window.addEventListener("beforeunload", onBeforeUnload);

		return () => {
			window.removeEventListener("beforeunload", onBeforeUnload);
			// In-app navigation: flush the pending debounced save instead of
			// dropping it.
			if (saveTimeoutRef.current) {
				clearTimeout(saveTimeoutRef.current);
				persist(answersRef.current);
			}
		};
	}, [persist]);

	async function handleFinalize() {
		if (saveTimeoutRef.current) {
			clearTimeout(saveTimeoutRef.current);
			saveTimeoutRef.current = undefined;
		}
		if (
			!window.confirm(
				"با ثبت نهایی، پاسخ‌ها و امضای شما ثبت می‌شود و دیگر قابل ویرایش نخواهد بود. ادامه می‌دهید؟",
			)
		) {
			return;
		}
		try {
			setFinalizing(true);
			// Finalize only what the server actually has: if the latest answers
			// could not be saved, stop instead of signing older answers.
			const saved = await persist(answers);
			if (!saved) return;
			const finalized = await finalizeOccurrenceResponse(occurrenceId);
			setResponse(finalized);
			toast.success("فرم با موفقیت ثبت نهایی و امضا شد.");
		} catch (err: any) {
			toast.error(err?.message || "خطا در ثبت نهایی فرم.");
		} finally {
			setFinalizing(false);
		}
	}

	async function handleDownloadCompletedPdf() {
		try {
			const blob = await downloadOccurrenceCompletedFormPdf(occurrenceId);
			downloadBlob({ blob, filename: `${title || "form"}.pdf` });
		} catch {
			toast.error("خطا در دانلود PDF.");
		}
	}

	async function handleShare() {
		await dialogs.open(ShareFormDialog, { occurrenceId });
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

	return (
		<Layout.Root>
			<Layout.Head title={title || "تکمیل فرم"}>
				<span className="text-xs text-muted-foreground">
					{isCompleted ? "ثبت نهایی شده" : SAVE_STATE_LABEL[saveState]}
				</span>
			</Layout.Head>
			<Layout.Content>
				<div className="flex flex-col gap-5">
					{questions.map((question, index) => (
						<div key={index} className="flex flex-col gap-2">
							{question.type !== FormQuestionType.StaticText && (
								<Label>
									{index + 1}. {question.title}
									{question.required && (
										<span className="text-destructive"> *</span>
									)}
								</Label>
							)}
							{question.description &&
								question.type !== FormQuestionType.StaticText && (
									<p className="text-xs text-muted-foreground">
										{question.description}
									</p>
								)}
							{question.type === FormQuestionType.StaticText ? (
								<p className="rounded-xl bg-gray-50 p-3 text-sm text-muted-foreground">
									{question.description || question.title}
								</p>
							) : (
								<QuestionResponseField
									question={question}
									value={answers[question.id as string]}
									onChange={(value) =>
										updateAnswer(question.id as string, value)
									}
									disabled={isCompleted}
								/>
							)}
						</div>
					))}

					{isCompleted ? (
						<div className="flex flex-col gap-2 border-t pt-4">
							<span className="text-sm text-muted-foreground">
								تکمیل‌کننده: {response?.completerName} -{" "}
								{response?.signedAt
									? moment(response.signedAt).format("jYYYY/jMM/jDD HH:mm")
									: ""}
							</span>
							{response?.signatureBase64 && (
								<img
									src={`data:image/png;base64,${response.signatureBase64}`}
									alt="امضا"
									className="h-16 w-auto"
								/>
							)}
							<div className="flex gap-2">
								<Button
									type="button"
									variant="outline"
									onClick={handleDownloadCompletedPdf}
								>
									دانلود PDF تکمیل‌شده
								</Button>
								<Button type="button" variant="outline" onClick={handleShare}>
									ارسال برای شخص دیگر
								</Button>
							</div>
						</div>
					) : (
						<div className="border-t pt-4">
							<Button
								type="button"
								disabled={finalizing}
								onClick={handleFinalize}
							>
								ثبت نهایی و امضا
							</Button>
						</div>
					)}
				</div>
			</Layout.Content>
		</Layout.Root>
	);
}

export { RespondPage };
