"use client";

import { useRef, useState } from "react";
import { FaDownload, FaPaperclip, FaTrash } from "react-icons/fa6";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import downloadBlob from "@/utils/downloadBlob";

import { FormAnswerFile } from "@/formBuilder/models/FormAnswerFile";
import { FormQuestion } from "@/formBuilder/models/FormQuestion";
import {
	deleteOccurrenceAnswerFile,
	uploadOccurrenceAnswerFile,
} from "@/formBuilder/services/answerFiles";

function FileAnswerField({
	question,
	value,
	onChange,
	disabled,
	occurrenceId,
	download,
}: {
	question: FormQuestion;
	value: unknown;
	onChange: (value: unknown) => void;
	disabled?: boolean;
	// Present only while the completer is filling the form.
	occurrenceId?: string;
	download?: (fileId: string) => Promise<Blob>;
}) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [busy, setBusy] = useState(false);

	const files = Array.isArray(value) ? (value as FormAnswerFile[]) : [];
	const settings = question.settings ?? {};
	const maxFiles = settings.maxFiles ?? 1;
	const allowed = settings.allowedFileTypes ?? [];
	const canUpload =
		!disabled && Boolean(occurrenceId) && files.length < maxFiles;

	async function handleSelect(file: File | undefined) {
		if (!file || !occurrenceId || !question.id) return;
		try {
			setBusy(true);
			const uploaded = await uploadOccurrenceAnswerFile(
				occurrenceId,
				question.id,
				file,
			);
			onChange([...files, uploaded]);
		} catch (err: any) {
			toast.error(err?.message || "خطا در بارگذاری فایل.");
		} finally {
			setBusy(false);
			if (inputRef.current) inputRef.current.value = "";
		}
	}

	async function handleRemove(file: FormAnswerFile) {
		if (!occurrenceId) return;
		try {
			setBusy(true);
			await deleteOccurrenceAnswerFile(occurrenceId, file.id);
			onChange(files.filter((f) => f.id !== file.id));
		} catch (err: any) {
			toast.error(err?.message || "خطا در حذف فایل.");
		} finally {
			setBusy(false);
		}
	}

	async function handleDownload(file: FormAnswerFile) {
		if (!download) return;
		try {
			const blob = await download(file.id);
			await downloadBlob({ blob, filename: file.name });
		} catch {
			toast.error("خطا در دریافت فایل.");
		}
	}

	return (
		<div className="flex flex-col gap-2">
			{files.length === 0 && disabled && (
				<span className="text-sm text-muted-foreground">-</span>
			)}

			{files.map((file) => (
				<div
					key={file.id}
					className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2 text-sm"
				>
					<FaPaperclip className="shrink-0 text-muted-foreground" />
					<span className="grow truncate">{file.name}</span>
					{download && (
						<Button
							type="button"
							size="icon"
							variant="ghost"
							title="دانلود"
							onClick={() => handleDownload(file)}
						>
							<FaDownload />
						</Button>
					)}
					{!disabled && occurrenceId && (
						<Button
							type="button"
							size="icon"
							variant="ghost"
							title="حذف"
							disabled={busy}
							onClick={() => handleRemove(file)}
						>
							<FaTrash className="text-destructive" />
						</Button>
					)}
				</div>
			))}

			{canUpload && (
				<div className="flex items-center gap-3">
					<input
						ref={inputRef}
						type="file"
						className="hidden"
						accept={allowed.length ? allowed.map((t) => `.${t}`).join(",") : undefined}
						onChange={(e) => handleSelect(e.target.files?.[0])}
					/>
					<Button
						type="button"
						variant="outline"
						disabled={busy}
						onClick={() => inputRef.current?.click()}
					>
						<Spinner loading={busy} size="sm">
							<FaPaperclip />
							<span className="ms-1">انتخاب فایل</span>
						</Spinner>
					</Button>
					<span className="text-xs text-muted-foreground">
						حداکثر {maxFiles} فایل
						{settings.maxFileSizeMb ? `، هر فایل تا ${settings.maxFileSizeMb} مگابایت` : ""}
						{allowed.length ? `، پسوندهای مجاز: ${allowed.join("، ")}` : ""}
					</span>
				</div>
			)}
		</div>
	);
}

export { FileAnswerField };
