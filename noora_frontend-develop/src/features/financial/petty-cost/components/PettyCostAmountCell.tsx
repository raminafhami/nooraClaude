import { Numeric } from "@/components/ui/numeric";
import { currency as currencies, Currency } from "@/enums/Currency";
import { PettyCostApi } from "@/financial/petty-cost/models/PettyCost";
import { toCurrency } from "@/utils/String";

const PettyCostAmountCell = ({ cost }: { cost: PettyCostApi }) => {
	return (
		<div className="space-y-1">
			<div>
				<Numeric value={toCurrency(cost.amount.toString())} />{" "}
				{currencies[cost.currency]?.title}
			</div>

			{cost.currency !== Currency.Rial && (
				<div className="text-xs">
					نرخ&nbsp;
					<Numeric value={toCurrency(cost.currencyRate.toString())} />
					&nbsp;ریال
				</div>
			)}

			{!!cost.vat && (
				<div className="text-xs">با احتساب مالیات بر ارزش افزوده</div>
			)}
		</div>
	);
};

export { PettyCostAmountCell };
