"use client";

import { DateInput } from "@/components/ui/date-input";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { FormQuestionType } from "@/formBuilder/enums/FormQuestionType";
import { FormQuestion } from "@/formBuilder/models/FormQuestion";

function QuestionResponseField({
	question,
	value,
	onChange,
	disabled,
}: {
	question: FormQuestion;
	value: unknown;
	onChange: (value: unknown) => void;
	disabled?: boolean;
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
				<Textarea
					disabled={disabled}
					rows={4}
					value={(value as string) ?? ""}
					maxLength={settings.maxLength ?? undefined}
					onChange={(e) => onChange(e.target.value)}
				/>
			);
		case FormQuestionType.Boolean:
			return (
				<div className="flex items-center gap-2">
					<Switch
						disabled={disabled}
						checked={Boolean(value)}
						onCheckedChange={(checked) => onChange(checked)}
					/>
					<span className="text-sm text-muted-foreground">
						{value ? "بله" : "خیر"}
					</span>
				</div>
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
				<p className="rounded-xl bg-gray-50 p-3 text-xs text-muted-foreground">
					بارگذاری فایل برای این سوال در نسخه فعلی در دسترس نیست.
				</p>
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
