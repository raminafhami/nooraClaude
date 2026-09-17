import { Numeric } from "@/components/ui/numeric";
import { PettyCostApi } from "@/financial/petty-cost/models/PettyCost";

const PettyCostAdditionalInfoCell = ({ cost }: { cost: PettyCostApi }) => {
	if (!cost.sellerNationalCode && !cost.invoiceNumber) {
		return "-";
	}

	return (
		<div className="space-y-1">
			{!!cost.sellerNationalCode && (
				<div>
					کد / شناسه ملی فروشنده: <Numeric value={cost.sellerNationalCode} />
				</div>
			)}

			{!!cost.invoiceNumber && (
				<div>
					شماره فاکتور: <Numeric value={cost.invoiceNumber} />
				</div>
			)}
		</div>
	);
};

export { PettyCostAdditionalInfoCell };
