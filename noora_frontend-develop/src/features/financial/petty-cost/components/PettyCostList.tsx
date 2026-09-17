"use client";

import moment from "jalali-moment";
import { useCallback, useState } from "react";
import { FaDownload, FaFolderOpen, FaTrash } from "react-icons/fa6";
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
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
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
import { PettyCostFilesDialog } from "@/financial/petty-cost/components/PettyCostFilesDialog";
import { PettyCostStatusBadge } from "@/financial/petty-cost/components/PettyCostStatusBadge";
import {
	PettyCostStatus,
	pettyCostStatusOptions,
} from "@/financial/petty-cost/enums/PettyCostStatus";
import {
	PettyCostType,
	pettyCostTypes,
} from "@/financial/petty-cost/enums/PettyCostType";
import { PettyCostApi } from "@/financial/petty-cost/models/PettyCost";
import { PettyCostQueryFilter } from "@/financial/petty-cost/models/PettyCostQuery";
import { deletePettyCost } from "@/financial/petty-cost/services/deletePettyCost";
import { getPettyCost } from "@/financial/petty-cost/services/getPettyCosts";
import { UserLookupSelect } from "@/identity/users/components/UserLookupSelect";
import { UserLookup } from "@/identity/users/models/UserLookup";
import { getUserFullname } from "@/identity/users/utils/getUserFullname";
import { asNavigationProp } from "@/utils/asNavigationProp";
import downloadBlob from "@/utils/downloadBlob";

import { getPettyCostReport } from "../services/getPettyCostReport";
import { PettyCostAdditionalInfoCell } from "./PettyCostAdditionalInfoCell";
import { PettyCostAmountCell } from "./PettyCostAmountCell";

function prepareFilters(
	searchByStatus: string,
	searchByUser: UserLookup | null,
	isAdmin: Boolean,
	id: string,
) {
	let filters: PettyCostQueryFilter = {};

	if (searchByStatus !== "all") {
		filters.status = searchByStatus;
	}

	if (isAdmin) {
		if (searchByUser) {
			filters.userId = searchByUser.id;
		}
	} else {
		filters.userId = id;
		filters.type = PettyCostType.Official;
	}

	return filters;
}

const PettyCostList = ({ isAdmin }: { isAdmin: Boolean }) => {
	const dialog = useDialogs();

	const { identity } = useLoggedInUser();

	// search
	const [searchByStatus, setSearchByStatus] = useState<any>();
	const [searchByUser, setSearchByUser] = useState<UserLookup | null>(null);

	// data
	const fetchData = useCallback(
		async (page: number, pageSize: number) => {
			const costs = await getPettyCost({
				filters: prepareFilters(
					searchByStatus,
					searchByUser,
					isAdmin,
					identity.id,
				),
				pagination: { page, pageSize },
				populate: ["categoryId", "userId"],
			});

			return [costs.items, costs.total] as const;
		},
		[identity.id, isAdmin, searchByStatus, searchByUser],
	);

	const { items, isLoading, offset, Pagination, refetch } =
		usePagination(fetchData);

	// dialogs
	const handleDeleteDialogOpen = useCallback(
		async (item: PettyCostApi) => {
			const result = await dialog.open(DeleteDialog, {
				title: item.description,
				onSubmit: async () => {
					await deletePettyCost(item.id);
				},
				onError: () => {
					toast.error("خطا در حذف هزینه");
				},
			});

			if (result) {
				toast.success("هزینه با موفقیت حذف شد");
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

	// export
	const [isPending, setIsPending] = useState<boolean>(false);

	async function handleExport() {
		try {
			setIsPending(true);

			const blob = await getPettyCostReport({
				filters: prepareFilters(
					searchByStatus,
					searchByUser,
					isAdmin,
					identity.id,
				),
				sort: { createdAt: "desc" },
			});
			await downloadBlob({ blob });
		} catch (err) {
			console.error(err);
			toast.error("خطای نامشخصی در دریافت گزارش هزینه ها رخ داد.");
		} finally {
			setIsPending(false);
		}
	}

	return (
		<Card className="col-span-full">
			<CardHeader orientation="horizontal">
				<CardTitle>فهرست هزینه ها</CardTitle>

				<CardNav>
					{isAdmin && (
						<div className="min-w-40">
							<UserLookupSelect
								placeholder="جستجو بر اساس کاربر"
								value={searchByUser || null}
								onValueChange={(e) => {
									setSearchByUser(e);
								}}
							/>
						</div>
					)}

					<div className="min-w-52">
						<Select
							onValueChange={(value) => {
								setSearchByStatus(value);
							}}
						>
							<SelectTrigger>
								<SelectValue placeholder="جستجو بر اساس وضعیت" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">همه</SelectItem>
								{pettyCostStatusOptions.map((item) => (
									<SelectItem key={item.value} value={item.value}>
										{item.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<Button
						disabled={isPending}
						variant="secondary"
						onClick={handleExport}
					>
						<Spinner loading={isPending} size="xs">
							<FaDownload />
						</Spinner>
						<span>دریافت گزارش</span>
					</Button>
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
							{isAdmin && <TableHead className="w-48">کاربر</TableHead>}
							<TableHead>توضیحات</TableHead>
							{isAdmin && <TableHead className="w-32">نوع</TableHead>}
							<TableHead className="w-48">مرکز هزینه</TableHead>
							<TableHead className="w-52">مبلغ</TableHead>
							<TableHead className="w-32">وضعیت</TableHead>
							<TableHead className="w-32">تاریخ پرداخت</TableHead>
							<TableHead className="w-64">اطلاعات تکمیلی</TableHead>
							<TableHead className="w-28">عملیات</TableHead>
						</TableRow>
					</TableHeader>

					<TableBody>
						{items?.length > 0 ? (
							items.map((cost, index) => (
								<TableRow key={cost.id} className="whitespace-nowrap">
									<TableCell>
										<Numeric value={offset + index + 1} />
									</TableCell>

									{isAdmin && (
										<TableCell>
											{getUserFullname(asNavigationProp(cost.userId))}
										</TableCell>
									)}

									<TableCell>{cost.description || "بدون توضیحات"}</TableCell>

									{isAdmin && (
										<TableCell>
											{pettyCostTypes[cost.type as PettyCostType].title}
										</TableCell>
									)}

									<TableCell>
										{asNavigationProp(cost.categoryId)?.title ?? "نامشخص"}
									</TableCell>

									<TableCell>
										<PettyCostAmountCell cost={cost} />
									</TableCell>

									<TableCell>
										<PettyCostStatusBadge cost={cost} />
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
																size="icon"
																variant="ghost"
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

												{!isAdmin && cost.status === PettyCostStatus.Unpaid && (
													<Tooltip>
														<TableAction>
															<TooltipTrigger asChild>
																<Button
																	variant="ghost"
																	size="icon"
																	onClick={() => handleDeleteDialogOpen(cost)}
																>
																	<FaTrash />
																</Button>
															</TooltipTrigger>
															<TooltipContent>حذف</TooltipContent>
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
								<TableCell colSpan={6}>هیچ موردی یافت نشد.</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
};

export { PettyCostList };
