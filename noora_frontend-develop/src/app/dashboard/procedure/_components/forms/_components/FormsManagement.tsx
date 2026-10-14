"use client";

import { useCallback, useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa6";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useDialogs } from "@/components/ui/dialog/use-dialogs";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import Pagination from "@/components/ui/pagination/Pagination";
import { Input } from "@/components/ui/input";
import { Loading } from "@/ui/Loader";

import { FormCategory } from "@/formBuilder/models/FormCategory";
import { Form } from "@/formBuilder/models/Form";
import { getFormCategories } from "@/formBuilder/services/getFormCategories";
import { getForms } from "@/formBuilder/services/getForms";
import { useTableData } from "@/cache/tableHook";

import { CreateFormDialog } from "./CreateFormDialog";
import { FormCard } from "./FormCard";

interface FormsFilters {
	title?: string;
	categoryId?: string;
}

function FormsManagement() {
	const dialogs = useDialogs();
	const [forms, setForms] = useState<Form[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(false);
	const [categories, setCategories] = useState<FormCategory[]>([]);

	const {
		currentPage,
		setCurrentPage,
		size,
		setSize,
		searchAttribute,
		setSearchAttribute,
	} = useTableData({
		tableName: "FormBuilderFormsTable",
		initialPage: 0,
		initialSize: 12,
	});

	const filters = searchAttribute as FormsFilters | undefined;

	const loadForms = useCallback(async () => {
		setLoading(true);
		try {
			const result = await getForms({
				pagination: { page: currentPage, pageSize: size },
				filters: {
					...(filters?.title
						? { title: { $regex: filters.title, $options: "i" } }
						: {}),
					...(filters?.categoryId ? { categoryId: filters.categoryId } : {}),
				},
				populate: ["category"],
				sort: { createdAt: "desc" },
			});
			setForms(result.items);
			setTotal(result.total);
		} catch {
			toast.error("خطا در دریافت فهرست فرم‌ها.");
		} finally {
			setLoading(false);
		}
	}, [currentPage, size, filters?.title, filters?.categoryId]);

	useEffect(() => {
		loadForms();
	}, [loadForms]);

	useEffect(() => {
		getFormCategories()
			.then(setCategories)
			.catch(() => toast.error("خطا در دریافت دسته‌بندی‌ها."));
	}, []);

	async function handleCreate() {
		const result = await dialogs.open(CreateFormDialog);
		if (result) {
			setCurrentPage(0);
			loadForms();
		}
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center gap-2">
				<Button type="button" onClick={handleCreate}>
					<FaPlus size={10} />
					<span className="ms-1">ایجاد فرم جدید</span>
				</Button>

				<Input
					className="max-w-[220px]"
					placeholder="🔎︎ جست‌وجوی نام یا کد فرم"
					value={filters?.title ?? ""}
					onChange={(e) =>
						setSearchAttribute((prev: any) => ({
							...prev,
							title: e.target.value,
						}))
					}
				/>

				<Select
					value={filters?.categoryId ?? "all"}
					onValueChange={(value) =>
						setSearchAttribute((prev: any) => ({
							...prev,
							categoryId: value === "all" ? undefined : value,
						}))
					}
				>
					<SelectTrigger className="max-w-[220px]">
						<SelectValue placeholder="دسته‌بندی" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">همه دسته‌بندی‌ها</SelectItem>
						{categories.map((category) => (
							<SelectItem key={category.id} value={category.id}>
								{category.title}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{loading ? (
				<Loading size="sm">در حال بارگزاری...</Loading>
			) : forms.length ? (
				<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
					{forms.map((form) => (
						<FormCard key={form.id} form={form} />
					))}
				</div>
			) : (
				<div className="py-10 text-center text-muted-foreground">
					فرمی یافت نشد.
				</div>
			)}

			<Pagination
				items={total}
				currentPage={currentPage}
				size={size}
				onPageChange={setCurrentPage}
				loading={loading}
				className="py-2"
				setSize={(value) => {
					setSize(value);
					setCurrentPage(0);
				}}
			/>
		</div>
	);
}

export { FormsManagement };
