"use client";

import moment from "jalali-moment";
import dynamic from "next/dynamic";
import { FaFolderOpen } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardNav,
	CardTitle,
} from "@/components/ui/card";
import { useDialogs } from "@/components/ui/dialog/use-dialogs";
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
import { PettyCostAdditionalInfoCell } from "@/financial/petty-cost/components/PettyCostAdditionalInfoCell";
import { PettyCostAmountCell } from "@/financial/petty-cost/components/PettyCostAmountCell";
import { PettyCostApi } from "@/financial/petty-cost/models/PettyCost";
import { asNavigationProp } from "@/utils/asNavigationProp";

import { PettyCostsExportButton } from "./PettyCostsExportButton";

const PettyCostFilesDialog = dynamic(() =>
	import("@/financial/petty-cost/components/PettyCostFilesDialog").then(
		(x) => x.PettyCostFilesDialog,
	),
);

function PettyCostList({
	pettyCostIds,
	pettyCosts,
	loading,
	isFromOutside,
}: {
	pettyCostIds: string[];
	pettyCosts: PettyCostApi[] | undefined;
	loading: boolean;
	isFromOutside: boolean;
}) {
	const dialogs = useDialogs();

	return (
		<div className="col-span-full !col-start-1 space-y-3 xl:col-span-10 2xl:col-span-8">
			<Card>
				<CardHeader orientation="horizontal">
					<CardTitle className="flex gap-2">
						فهرست هزینه ها
						{isFromOutside && (
							<span className="text-sm text-muted-foreground">(تنخواه)</span>
						)}
					</CardTitle>
					<CardNav>
						<PettyCostsExportButton pettyCostIds={pettyCostIds} />
					</CardNav>
				</CardHeader>
				<CardContent className="px-0">
					<Table
						loading={loading}
						slotProps={{ root: { className: "rounded-none border-x-0" } }}
					>
						<TableHeader>
							<TableRow className="whitespace-nowrap">
								<TableHead className="w-16">#</TableHead>
								<TableHead>توضیحات</TableHead>
								<TableHead className="w-48">مرکز هزینه</TableHead>
								<TableHead className="w-52">مبلغ</TableHead>
								{isFromOutside && (
									<TableHead className="w-32">تاریخ پرداخت</TableHead>
								)}
								<TableHead className="w-64">اطلاعات تکمیلی</TableHead>
								<TableHead className="w-28">عملیات</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{pettyCosts && pettyCosts.length ? (
								pettyCosts.map((cost, index) => (
									<TableRow
										key={cost.id}
										className="whitespace-nowrap"
										data-static
									>
										<TableCell>{index + 1}</TableCell>

										<TableCell>{cost.description}</TableCell>

										<TableCell>
											{asNavigationProp(cost.categoryId)?.title ?? "نامشخص"}
										</TableCell>

										<TableCell>
											<PettyCostAmountCell cost={cost} />
										</TableCell>

										{isFromOutside && (
											<TableCell>
												{moment(cost.spentDate).format("jYYYY/jMM/jDD")}
											</TableCell>
										)}

										<TableCell>
											<PettyCostAdditionalInfoCell cost={cost} />
										</TableCell>

										<TableCell>
											<TooltipProvider>
												<TableActions>
													<Tooltip>
														<TableAction>
															<TooltipTrigger asChild>
																<Button
																	className="size-full"
																	size="icon"
																	type="button"
																	variant="link"
																	onClick={async () => {
																		await dialogs.open(PettyCostFilesDialog, {
																			mode: "view",
																			costId: cost.id,
																		});
																	}}
																>
																	<FaFolderOpen />
																</Button>
															</TooltipTrigger>
															<TooltipContent>پیوست های هزینه</TooltipContent>
														</TableAction>
													</Tooltip>
												</TableActions>
											</TooltipProvider>
										</TableCell>
									</TableRow>
								))
							) : (
								<TableRow data-static>
									<TableCell colSpan={100}>هیچ موردی یافت نشد.</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}

export default PettyCostList;
