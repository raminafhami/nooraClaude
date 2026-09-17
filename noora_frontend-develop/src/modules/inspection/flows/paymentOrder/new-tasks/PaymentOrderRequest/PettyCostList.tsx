"use client";

import moment from "jalali-moment";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { FaFolderOpen, FaPlus, FaTrash } from "react-icons/fa6";
import { toast } from "sonner";

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
import { Currency } from "@/enums/Currency";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { PettyCostAdditionalInfoCell } from "@/financial/petty-cost/components/PettyCostAdditionalInfoCell";
import { PettyCostAmountCell } from "@/financial/petty-cost/components/PettyCostAmountCell";
import { PettyCostStatus } from "@/financial/petty-cost/enums/PettyCostStatus";
import { PettyCostApi } from "@/financial/petty-cost/models/PettyCost";
import { deletePettyCost } from "@/financial/petty-cost/services/deletePettyCost";
import { updatePettyCostStatus } from "@/financial/petty-cost/services/updatePettyCostStatus";
import { asNavigationProp } from "@/utils/asNavigationProp";

import { PettyCostsExportButton } from "../../components/PettyCostsExportButton";
import { Ids } from "../../data/Ids";

const PettyCostCreateDialog = dynamic(() =>
	import("./PettyCostCreateDialog").then((x) => x.PettyCostCreateDialog),
);

const PettyCostFilesDialog = dynamic(() =>
	import("@/financial/petty-cost/components/PettyCostFilesDialog").then(
		(x) => x.PettyCostFilesDialog,
	),
);

function PettyCostList({
	pettyCostIds,
	pettyCosts,
	loading,
	currency,
	isFromOutside,
}: {
	pettyCostIds: string[];
	pettyCosts: PettyCostApi[] | undefined;
	loading: boolean;
	currency: Currency | undefined;
	isFromOutside: boolean;
}) {
	const dialogs = useDialogs();

	const { save } = useTaskContext();

	const { setValue } = useFormContext();

	useEffect(() => {
		if (!pettyCosts) return;

		setValue(
			Ids.amount,
			(
				pettyCosts.reduce(
					(acc, curr) =>
						(acc += curr.currency === Currency.Rial ? curr.total : curr.amount),
					0,
				) || ""
			).toString(),
		);
		setValue(Ids.currency, pettyCosts.at(0)?.currency ?? ("" as Currency));
	}, [pettyCosts, setValue]);

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
					{(!isFromOutside || !!pettyCostIds.length) && (
						<CardNav>
							{!isFromOutside && (
								<Button
									type="button"
									variant="secondary"
									onClick={async () => {
										const createdPettyCost = await dialogs.open(
											PettyCostCreateDialog,
											{ currency },
										);

										if (createdPettyCost) {
											const nextCosts = [
												...(pettyCostIds ?? []),
												createdPettyCost.id,
											];

											setValue(Ids.pettyCostIds, nextCosts);
											save({ [Ids.pettyCostIds]: nextCosts });
										}
									}}
								>
									<FaPlus />
									<span>افزودن هزینه</span>
								</Button>
							)}

							{!!pettyCostIds.length && (
								<PettyCostsExportButton pettyCostIds={pettyCostIds} />
							)}
						</CardNav>
					)}
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
									<TableRow key={cost.id} className="whitespace-nowrap">
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

													{!isFromOutside && (
														<Tooltip>
															<TableAction>
																<TooltipTrigger asChild>
																	<Button
																		className="size-full"
																		size="icon"
																		type="button"
																		variant="link"
																		onClick={async () => {
																			try {
																				if (
																					cost.status ===
																					PettyCostStatus.Pending
																				) {
																					await updatePettyCostStatus(
																						PettyCostStatus.Unpaid,
																						[cost.id],
																					);
																				}

																				await deletePettyCost(cost.id);

																				const nextCosts = pettyCostIds!.filter(
																					(x) => x !== cost.id,
																				);

																				setValue(Ids.pettyCostIds, nextCosts);
																				save({
																					[Ids.pettyCostIds]: nextCosts,
																				});
																			} catch (err) {
																				console.error(err);
																				toast.error(
																					"خطای نامشخصی در هنگام حذف هزینه رخ داد.",
																				);
																			}
																		}}
																	>
																		<FaTrash />
																	</Button>
																</TooltipTrigger>
																<TooltipContent>حذف هزینه</TooltipContent>
															</TableAction>
														</Tooltip>
													)}
												</TableActions>
											</TooltipProvider>
										</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
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
