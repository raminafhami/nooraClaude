"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { FormQuestionType } from "@/formBuilder/enums/FormQuestionType";
import { FormQuestion } from "@/formBuilder/models/FormQuestion";

function PreviewField({ question }: { question: FormQuestion }) {
	const settings = question.settings ?? {};

	switch (question.type) {
		case FormQuestionType.StaticText:
			return (
				<p className="rounded-xl bg-gray-50 p-3 text-sm text-muted-foreground">
					{question.description || question.title}
				</p>
			);
		case FormQuestionType.LongText:
			return <Textarea disabled rows={3} placeholder="پاسخ متنی" />;
		case FormQuestionType.Boolean:
			return (
				<div className="flex items-center gap-2">
					<Switch disabled />
					<span className="text-sm text-muted-foreground">بله / خیر</span>
				</div>
			);
		case FormQuestionType.SingleChoice:
			return (
				<RadioGroup disabled>
					{(settings.options ?? []).map((option, index) => (
						<div key={index} className="flex items-center gap-2">
							<RadioGroupItem value={option.title || `${index}`} disabled />
							<span className="text-sm">{option.title || "گزینه"}</span>
						</div>
					))}
				</RadioGroup>
			);
		case FormQuestionType.MultiChoice:
			return (
				<div className="flex flex-col gap-2">
					{(settings.options ?? []).map((option, index) => (
						<div key={index} className="flex items-center gap-2">
							<Checkbox disabled />
							<span className="text-sm">{option.title || "گزینه"}</span>
						</div>
					))}
				</div>
			);
		case FormQuestionType.Date:
		case FormQuestionType.Time:
		case FormQuestionType.DateTime:
			return (
				<Input
					disabled
					placeholder={
						question.type === FormQuestionType.Time
							? "ساعت"
							: question.type === FormQuestionType.DateTime
								? "تاریخ و ساعت"
								: "تاریخ"
					}
				/>
			);
		case FormQuestionType.Rating:
			return (
				<div className="flex gap-1 text-lg text-muted-foreground">
					{Array.from({
						length: (settings.scaleMax ?? 5) - (settings.scaleMin ?? 1) + 1,
					}).map((_, i) => (
						<span key={i}>☆</span>
					))}
				</div>
			);
		case FormQuestionType.File:
			return (
				<Input disabled type="file" />
			);
		case FormQuestionType.Amount:
			return (
				<div className="flex items-center gap-2">
					<Input disabled placeholder="مبلغ" />
					{settings.currency && (
						<span className="text-sm text-muted-foreground">
							{settings.currency}
						</span>
					)}
				</div>
			);
		default:
			return <Input disabled placeholder="پاسخ" />;
	}
}

function FormPreviewDialog({
	payload,
	open,
	onClose,
}: {
	payload: { title: string; questions: FormQuestion[] };
	open: boolean;
	onClose: () => Promise<void>;
}) {
	return (
		<Dialog open={open} onOpenChange={() => onClose()}>
			<DialogContent className="max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>پیش‌نمایش فرم: {payload.title}</DialogTitle>
					<DialogDescription>
						این پیش‌نمایش فقط ظاهر فرم را نشان می‌دهد و امکان ثبت پاسخ ندارد.
					</DialogDescription>
				</DialogHeader>

				<div className="flex flex-col gap-5">
					{[...payload.questions]
						.sort((a, b) => a.order - b.order)
						.map((question, index) => (
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
								<PreviewField question={question} />
							</div>
						))}
				</div>
			</DialogContent>
		</Dialog>
	);
}

export { FormPreviewDialog };
