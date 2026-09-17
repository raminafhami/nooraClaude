import { CostPeriod } from "@/financial/costs/enums/CostPeriod";
import { costStatus, CostStatus } from "@/financial/costs/enums/CostStatus";
import { Cost } from "@/financial/costs/models/Cost";
import { cn } from "@/lib/utils";

import { CostItemPayButton } from "./CostItemPayButton";

function CostItemPayment({
	cost,
	isCasePaid,
	onChange,
}: {
	cost: Cost;
	isCasePaid: boolean;
	onChange: () => void;
}) {
	if (!cost.total || cost.total === "0") {
		return "-";
	}

	if (!cost.payment) {
		if (cost.period === CostPeriod.Any || isCasePaid) {
			return <CostItemPayButton cost={cost} onChange={onChange} />;
		} else {
			return <span className="text-xs">امکان پرداخت پس از وصول</span>;
		}
	}

	return (
		<div className="flex flex-col items-start gap-2 text-xs">
			<div
				className={cn(
					"relative -start-1 rounded-xl px-2 py-0.5",
					cost.status === CostStatus.Pending
						? "bg-yellow-50 text-yellow-900"
						: "bg-blue-50 text-blue-900",
				)}
			>
				{costStatus[cost.status]}
			</div>

			<div>
				<div>{`شماره درخواست: ${cost.payment.caseNo}`}</div>

				{/* {cost.status === CostStatus.Paid && (
          <>
            <div>{`شماره سند مالی: ${payment.documentNo}`}</div>
            <div>{`تاریخ پرداخت: ${payment.date}`}</div>
          </>
        )} */}
			</div>
		</div>
	);
}

export { CostItemPayment };
