"use client";

import dynamic from "next/dynamic";
import { useCallback } from "react";
import { FaList, FaPenToSquare, FaPlus, FaTrash } from "react-icons/fa6";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardIcon,
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
import { UserBankInfo } from "@/identity/users/models/UserBankInfo";
import { deleteUserBankInfo } from "@/identity/users/services/deleteUserBankInfo";
import getUserById from "@/identity/users/services/getUserById";

const UserBankInfoUpsertDialog = dynamic(
	() => import("@/identity/users/components/UserBankInfoUpsertDialog"),
);

const UserBankInfoList = ({ id }: { id: string }) => {
	const dialog = useDialogs();

	const fetchData = useCallback(async () => {
		const user = await getUserById(id);

		return [user.bankInfos ?? [], user.bankInfos?.length ?? 0] as const;
	}, [id]);

	const { items, isLoading, offset, Pagination, refetch } =
		usePagination(fetchData);

	const handleBankInfoUpsertDialog = useCallback(
		async (bankInfo?: UserBankInfo) => {
			const result = await dialog.open(UserBankInfoUpsertDialog, {
				userId: id,
				bankInfo,
			});

			if (result) {
				refetch();
			}
		},
		[dialog, id, refetch],
	);

	const handleBankInfoDeleteDialog = useCallback(
		async (bankId: string, bankName: string) => {
			const result = await dialog.open(DeleteDialog, {
				title: bankName ? `حساب ${bankName}` : "این حساب",
				onSubmit: async () => {
					await deleteUserBankInfo(id, bankId);
					toast.success("حساب بانکی با موفقیت حذف شد.");
				},
				onError: () => {
					toast.error("خطای نامشخصی در هنگام حذف حساب رخ داد.");
				},
			});

			if (result) {
				refetch();
			}
		},
		[dialog, id, refetch],
	);

	return (
		<div className="col-span-full">
			<Card>
				<CardHeader orientation="horizontal">
					<CardTitle>
						<CardIcon>
							<FaList />
						</CardIcon>
						فهرست حساب های بانکی
					</CardTitle>
					<CardNav>
						<Button
							onClick={() => {
								handleBankInfoUpsertDialog();
							}}
							variant="primary"
						>
							<FaPlus />
							<span>افزودن حساب</span>
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
								<TableHead className="w-28">عنوان</TableHead>
								<TableHead className="w-32">نام بانک</TableHead>
								<TableHead className="w-32">شعبه بانک</TableHead>
								<TableHead>نام صاحب حساب</TableHead>
								<TableHead className="w-46">شماره حساب</TableHead>
								<TableHead className="w-46">شماره کارت</TableHead>
								<TableHead className="w-52">شماره شبا</TableHead>
								<TableHead className="w-1">عملیات</TableHead>
							</TableRow>
						</TableHeader>

						<TableBody>
							{items?.length ? (
								items.map((item, index) => (
									<TableRow key={item.id} className="whitespace-nowrap">
										<TableCell>
											<Numeric value={offset + index + 1} />
										</TableCell>
										<TableCell>{item.title || "بدون عنوان"}</TableCell>

										<TableCell>{item.bankName || "-"}</TableCell>

										<TableCell>{item.bankBranch || "-"}</TableCell>

										<TableCell>{item.bankAccountOwner || "-"}</TableCell>

										<TableCell>
											<Numeric value={item.bankAccountNumber} placeholder="-" />
										</TableCell>

										<TableCell>
											<Numeric value={item.bankCardNumber} placeholder="-" />
										</TableCell>

										<TableCell>
											<Numeric value={item.bankSheba} placeholder="-" />
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
																	onClick={() => {
																		handleBankInfoUpsertDialog(item);
																	}}
																>
																	<FaPenToSquare />
																</Button>
															</TooltipTrigger>
															<TooltipContent>ویرایش حساب</TooltipContent>
														</TableAction>
														<TableAction>
															<TooltipTrigger asChild>
																<Button
																	className="size-full"
																	size="icon"
																	type="button"
																	variant="link"
																	onClick={() => {
																		handleBankInfoDeleteDialog(
																			item.id,
																			item.bankName,
																		);
																	}}
																>
																	<FaTrash />
																</Button>
															</TooltipTrigger>
															<TooltipContent>حذف حساب</TooltipContent>
														</TableAction>
													</Tooltip>
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
};

export { UserBankInfoList };
