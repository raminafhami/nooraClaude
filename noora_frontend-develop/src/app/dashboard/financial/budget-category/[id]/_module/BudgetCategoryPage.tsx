"use client";

import { useCallback, useEffect, useState } from "react";
import { FaLeftLong } from "react-icons/fa6";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DynamicLink } from "@/components/ui/dynamic-link";
import { Spinner } from "@/components/ui/spinner";
import { CategoryBudgetList } from "@/financial/category-budget/components/CategoryBudgetList";
import { FinancialCategory } from "@/financial/financial-category/models/FinancialCategory";
import { getFinancialCategories } from "@/financial/financial-category/services/getFinancialCategories";
import { CategoryDetail } from "@/financial/petty-category/components/CategoryDetail";
import { CostCategoryList } from "@/financial/petty-category/components/CostCategoryList";
import { Layout } from "@/ui/Layout";

function BudgetCategoryPage({ id }: { id: string }) {
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [category, setCategory] = useState<FinancialCategory>();

	const categoryQueryFn = useCallback(async () => {
		try {
			setIsLoading(true);

			const category = await getFinancialCategories({
				filters: { _id: id },
			}).then((response) => response[0]);

			setCategory(category);
		} catch (err) {
			console.error(err);
			toast.error("خطای نامشخصی در هنگام دریافت اطلاعات رخ داد.");
		} finally {
			setIsLoading(false);
		}
	}, [id]);

	useEffect(() => {
		categoryQueryFn();
	}, [categoryQueryFn]);

	return (
		<Layout.Root>
			<Layout.Head title="جزییات مرکز بودجه">
				<div className="sm:ms-auto">
					<DynamicLink href="/dashboard/financial?tab=petty-category">
						<Button>
							<FaLeftLong />
							<span>بازگشت به لیست</span>
						</Button>
					</DynamicLink>
				</div>
			</Layout.Head>

			<Layout.Content>
				{isLoading && <Spinner />}

				{category && (
					<div className="grid grid-cols-12 gap-10">
						<div className="col-span-full space-y-10 xl:col-span-4">
							<CategoryDetail
								category={category}
								loading={isLoading}
								onChange={categoryQueryFn}
							/>
							<CostCategoryList budgetCategory={category} />
						</div>

						<div className="col-span-full xl:col-span-8">
							<CategoryBudgetList budgetCategory={category} />
						</div>
					</div>
				)}
			</Layout.Content>
		</Layout.Root>
	);
}

export { BudgetCategoryPage };
