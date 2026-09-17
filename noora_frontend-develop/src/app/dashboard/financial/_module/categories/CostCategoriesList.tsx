"use client";

import { ReactNode, useCallback, useState } from "react";
import { FaPenToSquare, FaPlus } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardNav,
	CardTitle,
} from "@/components/ui/card";
import { usePagination } from "@/components/ui/pagination/usePagination";
import {
	Table,
	TableAction,
	TableActions,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { FinancialCategoryType } from "@/financial/financial-category/enums/FinancialCategoryType";
import { FinancialCategory } from "@/financial/financial-category/models/FinancialCategory";
import { getFinancialCategories } from "@/financial/financial-category/services/getFinancialCategories";

import { CategoryUpsertDialog } from "./CategoryUpsertDialog";

function CostCategoriesList() {
	const queryFn = useCallback(async (page: number, pageSize: number) => {
		const categories = await getFinancialCategories({
			filters: { type: FinancialCategoryType.Cost },
			sort: { code: "asc" },
			pagination: { page, pageSize },
		});

		return [categories.items, categories.total] as const;
	}, []);

	const { items, isLoading, error, offset, refetch, Pagination } =
		usePagination<FinancialCategory>(queryFn);

	const [upsertDialogOpen, setUpsertDialogOpen] = useState<boolean>(false);
	const [upsertDialogPayload, setUpsertDialogPayload] = useState<
		Omit<Partial<FinancialCategory>, "type"> & Pick<FinancialCategory, "type">
	>({ type: FinancialCategoryType.Cost });

	const handleUpsertDialogOpen = useCallback((payload?: FinancialCategory) => {
		setUpsertDialogPayload(payload ?? { type: FinancialCategoryType.Cost });
		setUpsertDialogOpen(true);
	}, []);

	const handleUpsertDialogClose = useCallback(
		(result?: FinancialCategory) => {
			setUpsertDialogOpen(false);
			if (result) refetch();
		},
		[refetch],
	);

	return (
		<>
			<Card>
				<CardHeader orientation="horizontal">
					<CardTitle>عناوین هزینه ها</CardTitle>
					<CardNav>
						<Button
							type="button"
							variant="primary"
							onClick={() => handleUpsertDialogOpen()}
						>
							<FaPlus />
							<span>ایجاد عنوان هزینه جدید</span>
						</Button>
					</CardNav>
				</CardHeader>
				<CardContent className="px-0">
					<CostCategoriesTable
						items={items}
						loading={isLoading}
						offset={offset}
						pagination={<Pagination />}
						onEdit={handleUpsertDialogOpen}
					/>
				</CardContent>
			</Card>

			<CategoryUpsertDialog
				payload={upsertDialogPayload}
				open={upsertDialogOpen}
				onClose={handleUpsertDialogClose}
			/>
		</>
	);
}

function CostCategoriesTable({
	items,
	loading,
	offset,
	pagination,
	onEdit,
}: {
	items: FinancialCategory[];
	loading: boolean;
	offset: number;
	pagination: ReactNode;
	onEdit: (category: FinancialCategory) => void;
}) {
	return (
		<Table
			loading={loading}
			pagination={pagination}
			slotProps={{ root: { className: "rounded-none border-x-0" } }}
		>
			<TableHeader>
				<TableRow className="whitespace-nowrap">
					<TableHead className="w-16">#</TableHead>
					<TableHead className="w-24">شناسه</TableHead>
					<TableHead>عنوان</TableHead>
					<TableHead className="w-36">عملیات</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{items.map((category, index) => (
					<TableRow key={category.id} className="whitespace-nowrap">
						<TableCell className="tracking-wide">
							{offset + index + 1}
						</TableCell>
						<TableCell className="tracking-wide">{category.code}</TableCell>
						<TableCell>{category.title}</TableCell>
						<TableCell>
							<TableActions>
								<TooltipProvider>
									<TableAction>
										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													size="icon"
													variant="link"
													onClick={() => onEdit(category)}
												>
													<FaPenToSquare />
												</Button>
											</TooltipTrigger>
											<TooltipContent>ویرایش عنوان</TooltipContent>
										</Tooltip>
									</TableAction>
								</TooltipProvider>
							</TableActions>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}

export { CostCategoriesList };
