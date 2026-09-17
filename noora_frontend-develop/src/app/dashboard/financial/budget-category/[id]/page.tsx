import { Metadata } from "next";

import { BudgetCategoryPage as BudgetCategoryClientPage } from "./_module/BudgetCategoryPage";

const metadata: Metadata = {
	title: "Budget Category Details",
};

function BudgetCategoryPage({
	params: { id },
}: {
	params: {
		id: string;
	};
}) {
	return <BudgetCategoryClientPage id={id} />;
}

export { metadata };
export default BudgetCategoryPage;
