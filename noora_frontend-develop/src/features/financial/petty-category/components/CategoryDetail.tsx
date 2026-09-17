"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { FaInfo, FaPencil, FaTrash } from "react-icons/fa6";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardIcon,
	CardNav,
	CardTitle,
} from "@/components/ui/card";
import { DeleteDialog } from "@/components/ui/dialog/delete-dialog";
import { useDialogs } from "@/components/ui/dialog/use-dialogs";
import { Spinner } from "@/components/ui/spinner";
import { FinancialCategory } from "@/financial/financial-category/models/FinancialCategory";

import { deleteCategory } from "../services/deleteCategory";
import PettyCategoryUpsertDialog from "./PettyCategoryUpsertDialog";

const CategoryDetail = ({
	category,
	loading,
	onChange,
}: {
	category: FinancialCategory;
	loading: boolean;
	onChange: () => Promise<void>;
}) => {
	const router = useRouter();

	const dialogs = useDialogs();

	// dialogs
	const handleCostCenterUpsertDialogOpen = useCallback(async () => {
		const result = await dialogs.open(PettyCategoryUpsertDialog, category);

		if (result) {
			onChange();
		}
	}, [dialogs, category, onChange]);

	const handleBudgetCategoryDeleteDialog = useCallback(
		async (item: FinancialCategory) => {
			const result = await dialogs.open(DeleteDialog, {
				title: `مرکز بودجه ${item.title}`,
				onSubmit: async () => {
					await deleteCategory(item.id);
					toast.success("مرکز بودجه با موفقیت حذف شد.");
				},
				onError: () => {
					toast.error("خطای نامشخصی در حذف مرکز بودجه رخ داد.");
				},
			});

			if (result) {
				router.push("/dashboard/financial?tab=petty-category");
			}
		},
		[dialogs, router],
	);

	return (
		<Card>
			<CardHeader orientation="horizontal">
				<CardTitle>
					<CardIcon>
						<FaInfo />
					</CardIcon>
					<span>اطلاعات مرکز بودجه</span>
					{category.isDeleted && <Badge variant="destructive">حذف شده</Badge>}
				</CardTitle>

				<CardNav>
					{!category.isDeleted && (
						<>
							<Button onClick={handleCostCenterUpsertDialogOpen}>
								<FaPencil />
								<span>ویرایش اطلاعات</span>
							</Button>

							<Button
								type="button"
								variant="destructive"
								onClick={() => {
									handleBudgetCategoryDeleteDialog(category!);
								}}
							>
								<FaTrash />
								<span>حذف مرکز بودجه</span>
							</Button>
						</>
					)}
				</CardNav>
			</CardHeader>

			<Spinner loading={loading}>
				<CardContent>
					<div className="grid grid-cols-12 gap-6">
						<div className="col-span-8 flex flex-col gap-2">
							<div className="text-muted-foreground">عنوان</div>
							<span>{category?.title}</span>
						</div>

						<div className="col-span-4 flex flex-col gap-2">
							<div className="text-muted-foreground">کد حسابداری</div>
							<span>{category?.code}</span>
						</div>
					</div>
				</CardContent>
			</Spinner>
		</Card>
	);
};

export { CategoryDetail };
