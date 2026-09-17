"use client";

import moment from "jalali-moment";
import dynamic from "next/dynamic";
import { useCallback } from "react";
import { FaFileInvoice, FaFolderOpen, FaPlus, FaTrash } from "react-icons/fa6";
import { toast } from "sonner";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardNav,
	CardTitle,
} from "@/components/ui/card";
import { DeleteDialog } from "@/components/ui/dialog/delete-dialog";
import { useDialogs } from "@/components/ui/dialog/use-dialogs";
import { Numeric } from "@/components/ui/numeric";
import { usePagination } from "@/components/ui/pagination/usePagination";
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
import { PettyCostCreateDialog } from "@/financial/petty-cost/components/PettyCostCreateDialog";
import { PettyCostFilesDialog } from "@/financial/petty-cost/components/PettyCostFilesDialog";
import { PettyCostStatus } from "@/financial/petty-cost/enums/PettyCostStatus";
import { PettyCostType } from "@/financial/petty-cost/enums/PettyCostType";
import { PettyCostApi } from "@/financial/petty-cost/models/PettyCost";
import { deletePettyCost } from "@/financial/petty-cost/services/deletePettyCost";
import { getPettyCost } from "@/financial/petty-cost/services/getPettyCosts";
import { asNavigationProp } from "@/utils/asNavigationProp";

import { PettyCostAdditionalInfoCell } from "./PettyCostAdditionalInfoCell";
import { PettyCostAmountCell } from "./PettyCostAmountCell";

const PettyCostsCheckoutDialog = dynamic(
	() => import("./PettyCostsCheckoutDialog"),
);

const UnpaidPettyCostList = () => {
	const dialog = useDialogs();

	const { identity } = useLoggedInUser();

	// data
	const fetchData = useCallback(
		async (page: number, pageSize: number) => {
			const costs = await getPettyCost({
				filters: {
					status: PettyCostStatus.Unpaid,
					userId: identity.id,
					type: PettyCostType.Official,
				},
				pagination: { page, pageSize },
				populate: ["categoryId", "userId"],
			});

			return [costs.items, costs.total] as const;
		},
		[identity.id],
	);

	const { items, isLoading, offset, Pagination, refetch } =
		usePagination(fetchData);

	// dialogs
	const handleAddDialogOpen = useCallback(async () => {
		const result = await dialog.open(PettyCostCreateDialog);

		if (result) {
			refetch();
		}
	}, [dialog, refetch]);

	const handleDeleteDialogOpen = useCallback(
		async (cost: PettyCostApi) => {
			const result = await dialog.open(DeleteDialog, {
				title: cost.description,
				onSubmit: async () => {
					await deletePettyCost(cost.id);
				},
				onError: () => {
					toast.error("خطای نامشخصی در هنگام حذف هزینه رخ داد.");
				},
			});

			if (result) {
				toast.success("هزینه مورد نظر با موفقیت حذف شد.");
				refetch();
			}
		},
		[dialog, refetch],
	);

	const handleFilesDialogOpen = useCallback(
		async (cost: PettyCostApi) => {
			await dialog.open(PettyCostFilesDialog, { costId: cost.id });
		},
		[dialog],
	);

	const handleCheckoutDialogOpen = useCallback(async () => {
		const result = await dialog.open(PettyCostsCheckoutDialog);

		if (result) {
			refetch();
		}
	}, [dialog, refetch]);

	return (
		<Card className="col-span-full">
			<CardHeader orientation="horizontal">
				<CardTitle>فهرست هزینه های تسویه نشده</CardTitle>

				<CardNav>
					<Button onClick={handleAddDialogOpen} variant="primary">
						<FaPlus />
						<span>افزودن هزینه</span>
					</Button>

					{!!items?.length && (
						<Button variant="secondary" onClick={handleCheckoutDialogOpen}>
							<FaFileInvoice />
							<span>تسویه پرداختی ها</span>
						</Button>
					)}
				</CardNav>
			</CardHeader>

			<CardContent className="px-0">
				<Table
					loading={isLoading}
					pagination={<Pagination />}
					slotProps={{
						root: { className: "rounded-none border-x-0" },
					}}
				>
					<TableHeader>
						<TableRow>
							<TableHead className="w-20">#</TableHead>
							<TableHead>توضیحات</TableHead>
							<TableHead className="w-48">مرکز هزینه</TableHead>
							<TableHead className="w-52">مبلغ</TableHead>
							<TableHead className="w-32">تاریخ پرداخت</TableHead>
							<TableHead className="w-64">اطلاعات تکمیلی</TableHead>
							<TableHead className="w-32">عملیات</TableHead>
						</TableRow>
					</TableHeader>

					<TableBody>
						{items?.length > 0 ? (
							items.map((cost, index) => (
								<TableRow key={cost.id} className="whitespace-nowrap">
									<TableCell>
										<Numeric value={offset + index + 1} />
									</TableCell>

									<TableCell>{cost.description || "بدون توضیحات"}</TableCell>

									<TableCell>
										{asNavigationProp(cost.categoryId)?.title ?? "نامشخص"}
									</TableCell>

									<TableCell>
										<PettyCostAmountCell cost={cost} />
									</TableCell>

									<TableCell>
										{moment(cost.spentDate).format("jYYYY/jMM/jDD")}
									</TableCell>

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
																variant="link"
																onClick={() => {
																	handleFilesDialogOpen(cost);
																}}
															>
																<FaFolderOpen />
															</Button>
														</TooltipTrigger>
														<TooltipContent>پیوست ها</TooltipContent>
													</TableAction>
												</Tooltip>

												<Tooltip>
													<TableAction>
														<TooltipTrigger asChild>
															<Button
																className="size-full"
																size="icon"
																variant="link"
																onClick={() => handleDeleteDialogOpen(cost)}
															>
																<FaTrash />
															</Button>
														</TooltipTrigger>
														<TooltipContent>حذف</TooltipContent>
													</TableAction>
												</Tooltip>
											</TableActions>
										</TooltipProvider>
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={8}>هیچ موردی یافت نشد.</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
};

export { UnpaidPettyCostList };
