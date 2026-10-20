"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

import { Form } from "@/formBuilder/models/Form";
import { FormCategory } from "@/formBuilder/models/FormCategory";
import { getFormCategories } from "@/formBuilder/services/getFormCategories";
import { updateForm } from "@/formBuilder/services/updateForm";

function EditFormMetaDialog({
	payload,
	open,
	onClose,
}: {
	payload: Form;
	open: boolean;
	onClose: (result?: Form) => Promise<void>;
}) {
	const [categories, setCategories] = useState<FormCategory[]>([]);
	const [title, setTitle] = useState(payload.title);
	// The API drops `categoryId` once `category` is populated, so fall back to
	// the populated category to pre-select the form's current category.
	const [categoryId, setCategoryId] = useState(
		payload.categoryId ?? payload.category?.id ?? "",
	);
	const [description, setDescription] = useState(payload.description ?? "");
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		getFormCategories()
			.then(setCategories)
			.catch(() => toast.error("خطا در دریافت دسته‌بندی‌ها."));
	}, []);

	async function handleSubmit() {
		if (!title.trim()) {
			toast.warning("پر کردن نام فرم ضروری است.");
			return;
		}
		try {
			setIsSubmitting(true);
			const form = await updateForm(payload.id, {
				title: title.trim(),
				categoryId,
				description: description.trim(),
			});
			toast.success("مشخصات فرم ویرایش شد.");
			await onClose(form);
		} catch (err: any) {
			toast.error(err?.message || "خطا در ویرایش فرم.");
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={() => !isSubmitting && onClose()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>ویرایش مشخصات فرم</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col gap-4">
					<div className="flex flex-col gap-2">
						<Label>نام فرم</Label>
						<Input value={title} onChange={(e) => setTitle(e.target.value)} />
					</div>

					<div className="flex flex-col gap-2">
						<Label>دسته‌بندی</Label>
						<Select value={categoryId} onValueChange={setCategoryId}>
							<SelectTrigger>
								<SelectValue placeholder={payload.category?.title ?? "انتخاب دسته‌بندی"} />
							</SelectTrigger>
							<SelectContent>
								{categories.map((category) => (
									<SelectItem key={category.id} value={category.id}>
										{category.title}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="flex flex-col gap-2">
						<Label>توضیحات</Label>
						<Textarea
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							rows={3}
						/>
					</div>
				</div>

				<DialogFooter>
					<Button type="button" disabled={isSubmitting} onClick={handleSubmit}>
						<Spinner loading={isSubmitting} size="sm">
							ذخیره
						</Spinner>
					</Button>
					<Button
						type="button"
						variant="ghost"
						disabled={isSubmitting}
						onClick={() => onClose()}
					>
						انصراف
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export { EditFormMetaDialog };
