"use client";

import { useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { DialogProps } from "@/components/ui/dialog/use-dialogs";
import { DynamicLink } from "@/components/ui/dynamic-link";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { ContractNumber } from "@/contract-number/models/ContractNumber";
import { ContractNumberDifference } from "@/contract-number/models/ContractNumberDifference";
import { findContractDifference } from "@/contract-number/services/findContractDifference";
import { getUserFullname } from "@/identity/users/utils/getUserFullname";
import { cn } from "@/lib/utils";
import { asNavigationProp } from "@/utils/asNavigationProp";

function ContractNumberDifferenceDialog({
	payload,
	open,
	onClose,
}: DialogProps<
	{
		contract: ContractNumber;
		differences: ContractNumberDifference;
		data: ContractNumberDifference;
	},
	ContractNumberDifference
>) {
	const [differences, setDifferences] = useState<ContractNumberDifference>(
		payload.differences,
	);

	const [isPending, setIsPending] = useState<boolean>(false);

	async function handleSubmit() {
		try {
			setIsPending(true);

			const differences = await findContractDifference(
				payload.contract.cn,
				payload.data,
			);

			if (differences) {
				setDifferences(differences);
				return;
			}

			onClose({});
		} catch {
		} finally {
			setIsPending(false);
		}
	}

	const DifferenceRow = ({
		children,
		title,
	}: React.PropsWithChildren & { title: string }) => {
		return (
			<TableRow className="text-center">
				<TableCell className="border-e bg-gray-100 !ps-4">{title}</TableCell>
				{children}
			</TableRow>
		);
	};

	return (
		<Dialog open={open} onOpenChange={() => onClose(differences)}>
			<DialogContent
				aria-describedby={undefined}
				className="max-w-screen-sm"
				onInteractOutside={(event) => {
					if (isPending) {
						event.preventDefault();
					}
				}}
			>
				<DialogHeader>
					<DialogTitle>مغایرت در اطلاعات قرارداد</DialogTitle>
				</DialogHeader>

				<div className="space-y-6">
					<div>
						اطلاعات وارد شده در درخواست در موارد زیر با اطلاعات قرارداد مغایرت
						دارند:
					</div>

					<Table
						loading={isPending}
						slotProps={{
							wrapper: { className: "-mx-6" },
							root: { className: "rounded-none border-x-0" },
						}}
					>
						<TableHeader>
							<TableRow>
								<TableHead className="w-32 border-e bg-gray-200 !ps-4"></TableHead>
								<TableHead className="text-center">درخواست</TableHead>
								<TableHead className="!pe-4 text-center">قرارداد</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{differences.buyer && (
								<DifferenceRow title="خریدار">
									<TableCell>{payload.data.buyer?.name}</TableCell>
									<TableCell className="!pe-4">
										{asNavigationProp(payload.contract.buyerId).name}
									</TableCell>
								</DifferenceRow>
							)}

							{differences.customer && (
								<DifferenceRow title="مشتری">
									<TableCell>{payload.data.customer?.name}</TableCell>
									<TableCell className="!pe-4">
										{getUserFullname(
											asNavigationProp(payload.contract.customerId),
										)}
									</TableCell>
								</DifferenceRow>
							)}

							{differences.proforma && (
								<DifferenceRow title="شماره پروفرما">
									<TableCell>{payload.data.proforma}</TableCell>
									<TableCell className="!pe-4">
										{payload.contract.proforma}
									</TableCell>
								</DifferenceRow>
							)}
						</TableBody>
					</Table>

					<div className="flex flex-col gap-3 xs:flex-row xs:justify-between">
						<DynamicLink
							className={cn(buttonVariants({ variant: "outline" }), "min-w-24")}
							href={`/dashboard/inspection/contract/${payload.contract.id}`}
							target="_blank"
						>
							مشاهده قرارداد
						</DynamicLink>

						<DialogFooter>
							<Button
								className="min-w-24"
								type="button"
								variant="primary"
								onClick={handleSubmit}
							>
								بررسی مجدد
							</Button>

							<DialogTrigger asChild>
								<Button type="button" variant="ghost">
									بازگشت
								</Button>
							</DialogTrigger>
						</DialogFooter>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default ContractNumberDifferenceDialog;
