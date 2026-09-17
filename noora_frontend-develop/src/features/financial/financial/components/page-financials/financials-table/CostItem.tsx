"use client";

import { useMemo } from "react";
import { FaPenToSquare, FaTrash } from "react-icons/fa6";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { Separator } from "@/components/ui/separator";
import { TableAction, TableActions, TableCell } from "@/components/ui/table";
import {
	CostService,
	costService,
	CostServiceConfig,
} from "@/financial/costs/enums/CostService";
import { CostServiceAccessType } from "@/financial/costs/enums/CostServiceAccessType";
import { CostStatus } from "@/financial/costs/enums/CostStatus";
import { deleteCost } from "@/financial/costs/services/deleteCost";
import {
	Financial,
	FinancialCost,
} from "@/financial/financial/models/Financial";

import { CostItemPaymentAmount } from "../../../../costs/components/CostItemPaymentAmount";
import { CostItemPayment } from "./CostItemPayment";

function CostItem({
	financial,
	isConfidentialUser,
	isPaid,
	onSelect,
	onChange,
}: {
	financial: FinancialCost;
	isConfidentialUser: boolean;
	isPaid: boolean;
	onSelect: (details: { financial: Financial }) => void;
	onChange: () => void;
}) {
	const { identity, isAuthorized } = useLoggedInUser();

	const { item: cost } = financial;

	const service: CostServiceConfig = cost.category?.key
		? costService[cost.category.key as CostService]
		: {
				accessType: CostServiceAccessType.Open,
				isEditable: true,
				isDeletable: true,
				isMultiple: true,
			};

	const showEdit = service.isEditable === undefined || service.isEditable;
	const showRemove = useMemo(
		() =>
			cost.status === CostStatus.Unpaid &&
			(service.isDeletable || isAuthorized({ groups: [] })),
		[cost.status, service.isDeletable, isAuthorized],
	);
	const showActions = showEdit || showRemove;

	return (
		<>
			<TableCell>
				<div className="flex flex-col gap-0.5">
					<span>{cost.title}</span>
					{cost.personName && (
						<span className="text-gray-600">{cost.personName}</span>
					)}
				</div>
			</TableCell>

			{isConfidentialUser ||
			cost.personId === identity.id ||
			service.accessType === CostServiceAccessType.Open ? (
				<>
					<TableCell>
						<CostItemPaymentAmount cost={cost} />
					</TableCell>

					<TableCell>
						<CostItemPayment
							cost={cost}
							isCasePaid={isPaid}
							onChange={onChange}
						/>
					</TableCell>

					<TableCell className="whitespace-pre-line">
						{cost.description || "-"}
					</TableCell>

					<TableCell>
						{showActions && (
							<TableActions>
								{showEdit && (
									<TableAction
										className="hover:text-yellow-500"
										title="Edit cost"
										onClick={async () => {
											onSelect({ financial });
										}}
									>
										<FaPenToSquare />
									</TableAction>
								)}

								{showRemove && (
									<TableAction
										className="hover:text-red-500"
										title="Remove cost"
										onClick={async () => {
											await deleteCost(cost.id);
											onChange();
										}}
									>
										<FaTrash />
									</TableAction>
								)}
							</TableActions>
						)}
					</TableCell>
				</>
			) : (
				<TableCell colSpan={100}>
					<Separator className="my-4 h-2 w-auto max-w-16 bg-gray-200" />
				</TableCell>
			)}
		</>
	);
}

export { CostItem };
