import { PettyCostList } from "@/financial/petty-cost/components/PettyCostList";
import { UnpaidPettyCostList } from "@/financial/petty-cost/components/UnpaidPettyCostList";

const PettyCostsPage = () => {
	return (
		<div className="space-y-8">
			<UnpaidPettyCostList />
			<PettyCostList isAdmin={false} />
		</div>
	);
};

export { PettyCostsPage };
