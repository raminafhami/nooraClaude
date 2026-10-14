"use client";

import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa6";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
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
import { createForm } from "@/formBuilder/services/createForm";
import { createFormCategory } from "@/formBuilder/services/createFormCategory";
import { getFormCategories } from "@/formBuilder/services/getFormCategories";

function CreateFormDialog({
	open,
	onClose,
}: {
	payload?: undefined;
	open: boolean;
	onClose: (result?: Form) => Promise<void>;
}) {
	const [categories, setCategories] = useState<FormCategory[]>([]);
	const [title, setTitle] = useState("");
	const [categoryId, setCategoryId] = useState<string>("");
	const [description, setDescription] = useState("");
	const [newCategoryTitle, setNewCategoryTitle] = useState("");
	const [isAddingCategory, setIsAddingCategory] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		if (!open) return;
		getFormCategories()
			.then(setCategories)
			.catch(() => toast.error("خطا در دریافت دسته‌بندی‌ها."));
	}, [open]);

	async function handleAddCategory() {
		if (!newCategoryTitle.trim()) return;
		try {
			setIsAddingCategory(true);
			const category = await createFormCategory(newCategoryTitle);
			setCategories((prev) => [...prev, category]);
			setCategoryId(category.id);
			setNewCategoryTitle("");
		} catch {
			toast.error("خطا در ایجاد دسته‌بندی جدید.");
		} finally {
			setIsAddingCategory(false);
		}
	}

	async function handleSubmit() {
		if (!title.trim()) {
			toast.warning("پر کردن نام فرم ضروری است.");
			return;
		}
		if (!categoryId) {
			toast.warning("انتخاب دسته‌بندی ضروری است.");
			return;
		}
		try {
			setIsSubmitting(true);
			const form = await createForm({
				title: title.trim(),
				categoryId,
				description: description.trim() || undefined,
			});
			toast.success("فرم جدید با موفقیت ایجاد شد.");
			await onClose(form);
		} catch {
			toast.error("خطا در ایجاد فرم.");
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={() => !isSubmitting && onClose()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>ایجاد فرم جدید</DialogTitle>
					<DialogDescription>
						کد فرم به‌صورت خودکار تولید می‌شود. برای افزودن سوالات، پس از
						ایجاد وارد صفحه فرم شوید.
					</DialogDescription>
				</DialogHeader>

				<div className="flex flex-col gap-4">
					<div className="flex flex-col gap-2">
						<Label>نام فرم</Label>
						<Input
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="مثلاً فرم بازرسی ورودی کالا"
						/>
					</div>

					<div className="flex flex-col gap-2">
						<Label>دسته‌بندی</Label>
						<Select value={categoryId} onValueChange={setCategoryId}>
							<SelectTrigger>
								<SelectValue placeholder="انتخاب دسته‌بندی" />
							</SelectTrigger>
							<SelectContent>
								{categories.map((category) => (
									<SelectItem key={category.id} value={category.id}>
										{category.title}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<div className="flex gap-2">
							<Input
								value={newCategoryTitle}
								onChange={(e) => setNewCategoryTitle(e.target.value)}
								placeholder="افزودن دسته‌بندی جدید"
								className="h-9"
							/>
							<Button
								type="button"
								variant="secondary"
								className="h-9 shrink-0"
								disabled={isAddingCategory || !newCategoryTitle.trim()}
								onClick={handleAddCategory}
							>
								<Spinner loading={isAddingCategory} size="sm">
									<FaPlus size={12} />
								</Spinner>
							</Button>
						</div>
					</div>

					<div className="flex flex-col gap-2">
						<Label>توضیحات (اختیاری)</Label>
						<Textarea
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							rows={3}
						/>
					</div>
				</div>

				<DialogFooter>
					<Button
						type="button"
						disabled={isSubmitting}
						onClick={handleSubmit}
					>
						<Spinner loading={isSubmitting} size="sm">
							ایجاد فرم
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

export { CreateFormDialog };
