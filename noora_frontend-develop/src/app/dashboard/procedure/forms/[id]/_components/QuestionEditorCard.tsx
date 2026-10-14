"use client";

import { FaChevronDown, FaChevronUp, FaTrash } from "react-icons/fa6";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import {
	FORM_QUESTION_TYPE_LABELS,
	FormQuestionType,
	NON_ANSWERABLE_QUESTION_TYPES,
} from "@/formBuilder/enums/FormQuestionType";
import { FormQuestion } from "@/formBuilder/models/FormQuestion";

import { QuestionSettingsFields } from "./QuestionSettingsFields";

function QuestionEditorCard({
	index,
	total,
	question,
	onChange,
	onRemove,
	onMove,
}: {
	index: number;
	total: number;
	question: FormQuestion;
	onChange: (question: FormQuestion) => void;
	onRemove: () => void;
	onMove: (direction: "up" | "down") => void;
}) {
	const isAnswerable = !NON_ANSWERABLE_QUESTION_TYPES.includes(question.type);

	return (
		<Card>
			<CardHeader className="gap-3 p-4">
				<div className="flex items-start gap-2">
					<span className="mt-2 flex size-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs">
						{index + 1}
					</span>

					<div className="flex grow flex-col gap-2">
						<Input
							value={question.title}
							placeholder="عنوان سوال"
							onChange={(e) =>
								onChange({ ...question, title: e.target.value })
							}
						/>
						<Textarea
							value={question.description ?? ""}
							placeholder="توضیحات (اختیاری)"
							rows={2}
							onChange={(e) =>
								onChange({ ...question, description: e.target.value })
							}
						/>
					</div>

					<div className="flex shrink-0 flex-col gap-1">
						<Button
							type="button"
							variant="ghost"
							size="icon"
							disabled={index === 0}
							onClick={() => onMove("up")}
						>
							<FaChevronUp size={12} />
						</Button>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							disabled={index === total - 1}
							onClick={() => onMove("down")}
						>
							<FaChevronDown size={12} />
						</Button>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							onClick={onRemove}
						>
							<FaTrash size={12} className="text-destructive" />
						</Button>
					</div>
				</div>

				<div className="flex flex-wrap items-end gap-3">
					<div className="flex flex-col gap-1">
						<Label className="text-xs text-muted-foreground">نوع پاسخ</Label>
						<Select
							value={question.type}
							onValueChange={(value) =>
								onChange({
									...question,
									type: value as FormQuestionType,
									settings: {},
								})
							}
						>
							<SelectTrigger className="w-[200px]">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{Object.values(FormQuestionType).map((type) => (
									<SelectItem key={type} value={type}>
										{FORM_QUESTION_TYPE_LABELS[type]}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{isAnswerable && (
						<div className="flex items-center gap-2">
							<Switch
								checked={question.required}
								onCheckedChange={(checked) =>
									onChange({ ...question, required: checked })
								}
							/>
							<Label className="text-xs text-muted-foreground">
								پاسخ اجباری باشد
							</Label>
						</div>
					)}
				</div>
			</CardHeader>

			<CardContent className="pt-0">
				<QuestionSettingsFields
					question={question}
					onChange={(settings) => onChange({ ...question, settings })}
				/>
			</CardContent>
		</Card>
	);
}

export { QuestionEditorCard };
