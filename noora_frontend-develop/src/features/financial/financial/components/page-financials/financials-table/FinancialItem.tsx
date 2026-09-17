import { FaCaretDown, FaCaretUp } from "react-icons/fa6";

import { TableCell, TableRow } from "@/components/ui/table";
import { Financial } from "@/financial/financial/models/Financial";
import { cn } from "@/lib/utils";

import { CostItem } from "./CostItem";
import { IncomeItem } from "./IncomeItem";

function FinancialItem({
	financial,
	index,
	isConfidentialUser,
	isPaid,
	onSelect,
	onChange,
}: {
	financial: Financial;
	index: number;
	isConfidentialUser: boolean;
	isPaid: boolean;
	onSelect: (details: { financial: Financial; force?: boolean }) => void;
	onChange: () => void;
}) {
	return (
		<TableRow>
			<TableCell>
				<div className="flex min-h-10 items-center">{index + 1}</div>
			</TableCell>
			<TableCell>
				<div
					className={cn(
						"flex w-fit items-center gap-1 rounded-xl px-3 py-1 text-xs",
						financial.type === "cost"
							? "bg-yellow-50 text-yellow-900"
							: "bg-blue-50 text-blue-900",
					)}
				>
					{financial.type === "cost" ? (
						<>
							<FaCaretDown className="text-base" />
							<span>هزینه</span>
						</>
					) : (
						<>
							<FaCaretUp className="text-base" />
							<span>درآمد</span>
						</>
					)}
				</div>
			</TableCell>
			{financial.type === "cost" ? (
				<CostItem
					financial={financial}
					isConfidentialUser={isConfidentialUser}
					isPaid={isPaid}
					onSelect={onSelect}
					onChange={onChange}
				/>
			) : (
				<IncomeItem
					financial={financial}
					onSelect={onSelect}
					onChange={onChange}
				/>
			)}
		</TableRow>
	);
}

export { FinancialItem };
