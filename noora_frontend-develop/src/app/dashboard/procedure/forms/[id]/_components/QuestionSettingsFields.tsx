"use client";

import { FaPlus, FaTrash } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
	CHOICE_QUESTION_TYPES,
	FormQuestionType,
} from "@/formBuilder/enums/FormQuestionType";
import { FormQuestion } from "@/formBuilder/models/FormQuestion";

function Field({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex flex-col gap-1">
			<Label className="text-xs text-muted-foreground">{label}</Label>
			{children}
		</div>
	);
}

function QuestionSettingsFields({
	question,
	onChange,
}: {
	question: FormQuestion;
	onChange: (settings: FormQuestion["settings"]) => void;
}) {
	const settings = question.settings ?? {};

	function update(patch: Partial<NonNullable<FormQuestion["settings"]>>) {
		onChange({ ...settings, ...patch });
	}

	if (CHOICE_QUESTION_TYPES.includes(question.type)) {
		const options = settings.options ?? [];
		return (
			<div className="flex flex-col gap-2">
				<Label className="text-xs text-muted-foreground">گزینه‌ها</Label>
				{options.map((option, index) => (
					<div key={index} className="flex gap-2">
						<Input
							value={option.title}
							placeholder={`گزینه ${index + 1}`}
							onChange={(e) => {
								const next = [...options];
								next[index] = { ...option, title: e.target.value };
								update({ options: next });
							}}
						/>
						<Button
							type="button"
							variant="ghost"
							className="shrink-0"
							onClick={() =>
								update({ options: options.filter((_, i) => i !== index) })
							}
						>
							<FaTrash size={12} className="text-destructive" />
						</Button>
					</div>
				))}
				<Button
					type="button"
					variant="secondary"
					className="w-fit"
					onClick={() =>
						update({
							options: [
								...options,
								{ title: "", order: options.length },
							],
						})
					}
				>
					<FaPlus size={10} />
					<span className="ms-1">افزودن گزینه</span>
				</Button>
			</div>
		);
	}

	if (
		question.type === FormQuestionType.ShortText ||
		question.type === FormQuestionType.LongText
	) {
		return (
			<Field label="حداکثر تعداد نویسه (اختیاری)">
				<Input
					type="number"
					value={settings.maxLength ?? ""}
					onChange={(e) =>
						update({
							maxLength: e.target.value ? Number(e.target.value) : null,
						})
					}
				/>
			</Field>
		);
	}

	if (
		question.type === FormQuestionType.Number ||
		question.type === FormQuestionType.Percent ||
		question.type === FormQuestionType.Amount
	) {
		return (
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
				<Field label="حداقل">
					<Input
						type="number"
						value={settings.minValue ?? ""}
						onChange={(e) =>
							update({
								minValue: e.target.value ? Number(e.target.value) : null,
							})
						}
					/>
				</Field>
				<Field label="حداکثر">
					<Input
						type="number"
						value={settings.maxValue ?? ""}
						onChange={(e) =>
							update({
								maxValue: e.target.value ? Number(e.target.value) : null,
							})
						}
					/>
				</Field>
				<Field label="تعداد اعشار">
					<Input
						type="number"
						value={settings.decimals ?? ""}
						onChange={(e) =>
							update({
								decimals: e.target.value ? Number(e.target.value) : null,
							})
						}
					/>
				</Field>
				{question.type === FormQuestionType.Amount && (
					<Field label="واحد پول">
						<Input
							value={settings.currency ?? ""}
							placeholder="ریال"
							onChange={(e) => update({ currency: e.target.value })}
						/>
					</Field>
				)}
			</div>
		);
	}

	if (question.type === FormQuestionType.Rating) {
		return (
			<div className="grid grid-cols-2 gap-3">
				<Field label="حداقل امتیاز">
					<Input
						type="number"
						value={settings.scaleMin ?? 1}
						onChange={(e) => update({ scaleMin: Number(e.target.value) })}
					/>
				</Field>
				<Field label="حداکثر امتیاز">
					<Input
						type="number"
						value={settings.scaleMax ?? 5}
						onChange={(e) => update({ scaleMax: Number(e.target.value) })}
					/>
				</Field>
			</div>
		);
	}

	if (question.type === FormQuestionType.File) {
		return (
			<div className="grid grid-cols-2 gap-3">
				<Field label="حداکثر تعداد فایل">
					<Input
						type="number"
						value={settings.maxFiles ?? ""}
						onChange={(e) =>
							update({
								maxFiles: e.target.value ? Number(e.target.value) : null,
							})
						}
					/>
				</Field>
				<Field label="حداکثر حجم هر فایل (مگابایت)">
					<Input
						type="number"
						value={settings.maxFileSizeMb ?? ""}
						onChange={(e) =>
							update({
								maxFileSizeMb: e.target.value
									? Number(e.target.value)
									: null,
							})
						}
					/>
				</Field>
				<Field label="پسوندهای مجاز (با کاما جدا کنید)">
					<Input
						value={(settings.allowedFileTypes ?? []).join(", ")}
						placeholder="pdf, jpg, png"
						onChange={(e) =>
							update({
								allowedFileTypes: e.target.value
									.split(",")
									.map((s) => s.trim())
									.filter(Boolean),
							})
						}
					/>
				</Field>
			</div>
		);
	}

	// boolean / date / time / datetime / static_text need no extra settings.
	return null;
}

export { QuestionSettingsFields };
