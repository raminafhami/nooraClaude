"use client";

import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa6";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

import { FormQuestionType } from "@/formBuilder/enums/FormQuestionType";
import { FormQuestion } from "@/formBuilder/models/FormQuestion";
import { FormVersion } from "@/formBuilder/models/FormVersion";
import { saveDraftQuestions } from "@/formBuilder/services/saveDraftQuestions";

import { QuestionEditorCard } from "./QuestionEditorCard";

function reorder(questions: FormQuestion[]): FormQuestion[] {
	return questions.map((question, index) => ({ ...question, order: index }));
}

function QuestionBuilder({
	formId,
	draftVersion,
	onSaved,
}: {
	formId: string;
	draftVersion: FormVersion;
	onSaved: () => void;
}) {
	const [questions, setQuestions] = useState<FormQuestion[]>(
		reorder(draftVersion.questions ?? []),
	);
	const [isSaving, setIsSaving] = useState(false);
	const [isDirty, setIsDirty] = useState(false);

	useEffect(() => {
		setQuestions(reorder(draftVersion.questions ?? []));
		setIsDirty(false);
	}, [draftVersion]);

	function updateQuestions(next: FormQuestion[]) {
		setQuestions(reorder(next));
		setIsDirty(true);
	}

	function handleAdd() {
		updateQuestions([
			...questions,
			{
				title: "",
				type: FormQuestionType.ShortText,
				required: false,
				order: questions.length,
				settings: {},
			},
		]);
	}

	function handleChange(index: number, question: FormQuestion) {
		const next = [...questions];
		next[index] = question;
		updateQuestions(next);
	}

	function handleRemove(index: number) {
		updateQuestions(questions.filter((_, i) => i !== index));
	}

	function handleMove(index: number, direction: "up" | "down") {
		const targetIndex = direction === "up" ? index - 1 : index + 1;
		if (targetIndex < 0 || targetIndex >= questions.length) return;
		const next = [...questions];
		[next[index], next[targetIndex]] = [next[targetIndex], next[index]];
		updateQuestions(next);
	}

	async function handleSave() {
		if (questions.some((q) => !q.title.trim())) {
			toast.warning("عنوان همه سوالات باید تکمیل شود.");
			return;
		}
		try {
			setIsSaving(true);
			await saveDraftQuestions(formId, questions);
			toast.success("تغییرات سوالات ذخیره شد.");
			setIsDirty(false);
			onSaved();
		} catch (err: any) {
			toast.error(err?.message || "خطا در ذخیره سوالات.");
		} finally {
			setIsSaving(false);
		}
	}

	return (
		<div className="flex flex-col gap-4">
			{questions.map((question, index) => (
				<QuestionEditorCard
					key={index}
					index={index}
					total={questions.length}
					question={question}
					onChange={(q) => handleChange(index, q)}
					onRemove={() => handleRemove(index)}
					onMove={(direction) => handleMove(index, direction)}
				/>
			))}

			{!questions.length && (
				<div className="py-6 text-center text-muted-foreground">
					هنوز سوالی اضافه نشده است.
				</div>
			)}

			<div className="flex gap-2 border-t pt-4">
				<Button type="button" variant="secondary" onClick={handleAdd}>
					<FaPlus size={10} />
					<span className="ms-1">افزودن سوال</span>
				</Button>

				<Button
					type="button"
					disabled={isSaving || !isDirty}
					onClick={handleSave}
				>
					<Spinner loading={isSaving} size="sm">
						ذخیره تغییرات
					</Spinner>
				</Button>
			</div>
		</div>
	);
}

export { QuestionBuilder };
