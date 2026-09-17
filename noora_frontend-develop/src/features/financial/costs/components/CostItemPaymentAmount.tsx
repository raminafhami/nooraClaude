import { currency, Currency } from "@/enums/Currency";
import { costMethod } from "@/financial/costs/enums/CostMethod";
import { CostType } from "@/financial/costs/enums/CostType";
import { Cost } from "@/financial/costs/models/Cost";
import { toCurrency } from "@/utils/String";

function CostItemPaymentAmount({
	cost,
	options,
}: {
	cost: Cost;
	options?: Partial<{ percentage: boolean; method: boolean }>;
}) {
	if (!cost.type || !cost.method || !cost.amount) {
		return <span className="text-red-700">نامشخص</span>;
	}

	if (cost.amount !== "0" && cost.total === "0") {
		return (
			<div className="flex flex-col gap-1 text-xs text-red-700">
				<span>عدم محاسبه</span>
				<span>به دلیل منفی شدن</span>
			</div>
		);
	}

	const showPercentage = options?.percentage ?? true;
	const showMethod = options?.method ?? true;

	return (
		<div className="-mb-0.5 flex flex-col gap-1.5 text-xs">
			{cost.currency &&
				cost.currencyRate &&
				cost.currency !== Currency.Rial && (
					<span>
						{cost.amount} {currency[cost.currency].title} با نرخ{" "}
						{toCurrency(cost.currencyRate.toString())} ریال
					</span>
				)}

			<span>
				{cost.type === CostType.Fixed || !showPercentage
					? `${toCurrency(cost.total)} ریال`
					: `%${cost.amount} = ${toCurrency(cost.total)} ریال`}
			</span>
			{showMethod && <span>{costMethod[cost.method]}</span>}
		</div>
	);
}

export { CostItemPaymentAmount };
