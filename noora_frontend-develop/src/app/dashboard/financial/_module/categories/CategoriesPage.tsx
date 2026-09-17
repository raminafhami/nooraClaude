import { Head } from "@/ui/Head";

import { CostCategoriesList } from "./CostCategoriesList";
import { IncomeCategoriesList } from "./IncomeCategoriesList";

function CategoriesPage() {
	return (
		<div className="space-y-8">
			<Head.Root>
				<Head.Title>فهرست دسته بندی ها</Head.Title>
			</Head.Root>

			<div className="grid grid-cols-12 gap-6">
				<div className="col-span-full lg:col-span-6">
					<IncomeCategoriesList />
				</div>
				<div className="col-span-full lg:col-span-6">
					<CostCategoriesList />
				</div>
			</div>
		</div>
	);
}

export { CategoriesPage };
