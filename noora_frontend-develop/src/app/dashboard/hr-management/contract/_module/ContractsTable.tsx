"use client";

import moment from "jalali-moment";
import { ReactNode } from "react";
import { FaEye, FaPaperPlane, FaPencil } from "react-icons/fa6";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { Button } from "@/components/ui/button";
import { DynamicLink } from "@/components/ui/dynamic-link";
import {
	Table,
	TableAction,
	TableActions,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { ContractStatusBadge } from "@/hrm/contract/components/ContractStatusBadge";
import { ContractStatus } from "@/hrm/contract/enums/ContractStatus";
import { initializePersonnelContract } from "@/hrm/contract/flows/personnel-contract/services/initializePersonnelContract";
import { Contract } from "@/hrm/contract/models/Contract";
import { UserType } from "@/identity/users/models/UserType";

function ContractsTable({
	items: contracts,
	loading,
	error,
	offset,
	pagination,
}: {
	items: Contract[];
	loading: boolean;
	error: string | null;
	offset: number;
	pagination: ReactNode;
}) {
	return (
		<Table
			loading={loading}
			pagination={pagination}
			slotProps={{ root: { className: "rounded-none border-x-0" } }}
		>
			<TableHeader>
				<TableRow className="whitespace-nowrap">
					<TableHead className="w-20">#</TableHead>
					<TableHead className="w-72">نام</TableHead>
					<TableHead className="w-48">وضعیت قرارداد</TableHead>
					<TableHead className="w-48">شماره قرارداد</TableHead>
					<TableHead className="w-52">محل کار</TableHead>
					<TableHead className="w-32">مدت قرارداد</TableHead>
					<TableHead className="w-72">تاریخ قرارداد</TableHead>
					<TableHead className="hidden xl:table-cell"></TableHead>
					<TableHead className="w-1">عملیات</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{contracts.length !== 0 ? (
					contracts.map((contract, index) => (
						<ContractItem
							key={contract.id}
							contract={contract}
							index={offset + index}
						/>
					))
				) : (
					<TableRow key="empty">
						<TableCell colSpan={100}>قراردادی یافت نشد.</TableCell>
					</TableRow>
				)}
			</TableBody>
		</Table>
	);
}

function ContractItem({
	contract,
	index,
}: {
	contract: Contract;
	index: number;
}) {
	const { identity } = useLoggedInUser();

	const canInitiateProcess = identity.type === UserType.System;

	return (
		<TableRow key={contract.id} className="whitespace-nowrap">
			<TableCell>{index + 1}</TableCell>
			<TableCell>{contract.fullname}</TableCell>
			<TableCell>
				<ContractStatusBadge status={contract.status} />
			</TableCell>
			<TableCell>
				<span className="tracking-wide" dir="ltr">
					{contract.contractNo}
				</span>
			</TableCell>
			<TableCell>{contract.workplace}</TableCell>
			<TableCell>{contract.period} ماه</TableCell>
			<TableCell>
				<ContractItemDate date={contract.startDate} /> تا{" "}
				<ContractItemDate date={contract.endDate} />
			</TableCell>
			<TableCell className="hidden xl:table-cell"></TableCell>
			<TableCell>
				<TooltipProvider>
					<TableActions>
						{contract.status === ContractStatus.Draft ? (
							<TableAction>
								<Tooltip>
									<TooltipTrigger asChild>
										<DynamicLink
											className="flex h-full items-center"
											href={`/dashboard/hr-management/contract/${contract.id}/edit`}
										>
											<Button
												className="h-full focus-within:text-yellow-600 hover:text-yellow-600 active:text-yellow-600"
												size="icon"
												variant="ghost"
											>
												<FaPencil />
											</Button>
										</DynamicLink>
									</TooltipTrigger>
									<TooltipContent>ویرایش قرارداد</TooltipContent>
								</Tooltip>
							</TableAction>
						) : (
							<TableAction>
								<Tooltip>
									<TooltipTrigger asChild>
										<DynamicLink
											className="flex h-full items-center"
											href={`/dashboard/hr-management/contract/${contract.id}`}
										>
											<Button
												className="h-full focus-within:text-blue-600 hover:text-blue-600 active:text-blue-600"
												size="icon"
												variant="ghost"
											>
												<FaEye />
											</Button>
										</DynamicLink>
									</TooltipTrigger>
									<TooltipContent>مشاهده قرارداد</TooltipContent>
								</Tooltip>
							</TableAction>
						)}

						{canInitiateProcess && (
							<TableAction>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											className="focus-within:text-yellow-600 hover:text-yellow-600 active:text-yellow-600"
											size="icon"
											variant="link"
											onClick={async () => {
												await initializePersonnelContract(contract);
											}}
										>
											<FaPaperPlane />
										</Button>
									</TooltipTrigger>
									<TooltipContent>ایجاد فرایند قرارداد پرسنل</TooltipContent>
								</Tooltip>
							</TableAction>
						)}
					</TableActions>
				</TooltipProvider>
			</TableCell>
		</TableRow>
	);
}

function ContractItemDate({ date }: { date: string }) {
	return moment(date, "YYYY-MM-DD").format("jYYYY/jMM/jDD");
}

export { ContractsTable };
