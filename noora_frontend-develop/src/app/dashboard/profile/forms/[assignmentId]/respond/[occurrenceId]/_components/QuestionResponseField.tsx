"use client";

import { useLayoutEffect, useRef } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { DateInput } from "@/components/ui/date-input";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

import { FormQuestionType } from "@/formBuilder/enums/FormQuestionType";
import { FormQuestion } from "@/formBuilder/models/FormQuestion";

import { FileAnswerField } from "./FileAnswerField";

// Grows with its content while typing (spec 7.2: متن بلند با ارتفاع خودکار).
function AutoGrowTextarea(props: React.ComponentProps<typeof Textarea>) {
	const ref = useRef<HTMLTextAreaElement>(null);

	useLayoutEffect(() => {
		const el = ref.current;
		if (!el) return;
		el.style.height = "auto";
		el.style.height = `${el.scrollHeight}px`;
	}, [props.value]);

	return <Textarea ref={ref} className="resize-none overflow-hidden" {...props} />;
}

function QuestionResponseField({
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
	// FILE questions: occurrenceId enables upload/remove (completer only);
	// download is the viewer-specific downloader for attached files.
	occurrenceId?: string;
	download?: (fileId: string) => Promise<Blob>;
}) {
	const settings = question.settings ?? {};

	switch (question.type) {
		case FormQuestionType.ShortText:
			return (
				<Input
					disabled={disabled}
					value={(value as string) ?? ""}
					maxLength={settings.maxLength ?? undefined}
					onChange={(e) => onChange(e.target.value)}
				/>
			);
		case FormQuestionType.LongText:
			return (
				<AutoGrowTextarea
					disabled={disabled}
					rows={3}
					value={(value as string) ?? ""}
					maxLength={settings.maxLength ?? undefined}
					onChange={(e) => onChange(e.target.value)}
				/>
			);
		case FormQuestionType.Boolean:
			// Explicit choice: an unanswered question must not look like "خیر".
			return (
				<RadioGroup
					disabled={disabled}
					className="flex gap-6"
					value={typeof value === "boolean" ? String(value) : ""}
					onValueChange={(v) => onChange(v === "true")}
				>
					<div className="flex items-center gap-2">
						<RadioGroupItem value="true" />
						<span className="text-sm">بله</span>
					</div>
					<div className="flex items-center gap-2">
						<RadioGroupItem value="false" />
						<span className="text-sm">خیر</span>
					</div>
				</RadioGroup>
			);
		case FormQuestionType.Number:
		case FormQuestionType.Percent:
			return (
				<Input
					disabled={disabled}
					type="number"
					min={settings.minValue ?? undefined}
					max={settings.maxValue ?? undefined}
					step={
						settings.decimals ? 1 / Math.pow(10, settings.decimals) : 1
					}
					value={(value as number) ?? ""}
					onChange={(e) =>
						onChange(e.target.value === "" ? null : Number(e.target.value))
					}
				/>
			);
		case FormQuestionType.Amount:
			return (
				<div className="flex items-center gap-2">
					<Input
						disabled={disabled}
						type="number"
						min={settings.minValue ?? undefined}
						max={settings.maxValue ?? undefined}
						value={(value as number) ?? ""}
						onChange={(e) =>
							onChange(e.target.value === "" ? null : Number(e.target.value))
						}
					/>
					{settings.currency && (
						<span className="text-sm text-muted-foreground">
							{settings.currency}
						</span>
					)}
				</div>
			);
		case FormQuestionType.SingleChoice:
			return (
				<RadioGroup
					disabled={disabled}
					value={(value as string) ?? ""}
					onValueChange={(v) => onChange(v)}
				>
					{(settings.options ?? []).map((option, index) => (
						<div key={index} className="flex items-center gap-2">
							<RadioGroupItem value={option.title} />
							<span className="text-sm">{option.title}</span>
						</div>
					))}
				</RadioGroup>
			);
		case FormQuestionType.MultiChoice: {
			const selected = Array.isArray(value) ? (value as string[]) : [];
			return (
				<div className="flex flex-col gap-2">
					{(settings.options ?? []).map((option, index) => (
						<div key={index} className="flex items-center gap-2">
							<Checkbox
								disabled={disabled}
								checked={selected.includes(option.title)}
								onCheckedChange={(checked) => {
									if (checked) {
										onChange([...selected, option.title]);
									} else {
										onChange(selected.filter((v) => v !== option.title));
									}
								}}
							/>
							<span className="text-sm">{option.title}</span>
						</div>
					))}
				</div>
			);
		}
		case FormQuestionType.Date:
			return (
				<DateInput
					disabled={disabled}
					value={(value as string) ?? ""}
					onChange={(v) => onChange(v)}
				/>
			);
		case FormQuestionType.Time:
			return (
				<Input
					disabled={disabled}
					type="time"
					value={(value as string) ?? ""}
					onChange={(e) => onChange(e.target.value)}
				/>
			);
		case FormQuestionType.DateTime:
			return (
				<div className="flex gap-2">
					<DateInput
						disabled={disabled}
						value={((value as any)?.date as string) ?? ""}
						onChange={(v) => onChange({ ...(value as any), date: v })}
					/>
					<Input
						disabled={disabled}
						type="time"
						className="max-w-[140px]"
						value={((value as any)?.time as string) ?? ""}
						onChange={(e) =>
							onChange({ ...(value as any), time: e.target.value })
						}
					/>
				</div>
			);
		case FormQuestionType.Rating: {
			const min = settings.scaleMin ?? 1;
			const max = settings.scaleMax ?? 5;
			const current = (value as number) ?? 0;
			return (
				<div className="flex gap-1 text-xl">
					{Array.from({ length: max - min + 1 }).map((_, i) => {
						const score = min + i;
						return (
							<button
								type="button"
								key={score}
								disabled={disabled}
								onClick={() => onChange(score)}
								className={
									score <= current ? "text-amber-500" : "text-gray-300"
								}
							>
								★
							</button>
						);
					})}
				</div>
			);
		}
		case FormQuestionType.File:
			return (
				<FileAnswerField
					question={question}
					value={value}
					onChange={onChange}
					disabled={disabled}
					occurrenceId={occurrenceId}
					download={download}
				/>
			);
		case FormQuestionType.StaticText:
			return null;
		default:
			return (
				<Input
					disabled={disabled}
					value={(value as string) ?? ""}
					onChange={(e) => onChange(e.target.value)}
				/>
			);
	}
}

export { QuestionResponseField };
