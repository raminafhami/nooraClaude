"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import {
	FaDownload,
	FaEllipsis,
	FaFolderOpen,
	FaPenToSquare,
	FaTrash,
	FaUserPlus,
} from "react-icons/fa6";
import { toast } from "sonner";

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
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Numeric } from "@/components/ui/numeric";
import { usePagination } from "@/components/ui/pagination/usePagination";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
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
import { PettyCashApi } from "@/financial/petty-cash/models/PettyCash";
import { deletePettyCash } from "@/financial/petty-cash/services/deletePettyCash";
import { getPettyCash } from "@/financial/petty-cash/services/getPettyCash";
import { UserLookupSelect } from "@/identity/users/components/UserLookupSelect";
import { UserLookup } from "@/identity/users/models/UserLookup";
import { getUserFullname } from "@/identity/users/utils/getUserFullname";
import { asNavigationProp } from "@/utils/asNavigationProp";
import downloadBlob from "@/utils/downloadBlob";
import { toCurrency } from "@/utils/String";

import { PettyCashQueryFilter } from "../models/PettyCashQuery";
import { getPettyCashReport } from "../services/getPettyCashReport";
import { PettyCashAddDialog } from "./PettyCashAddDialog";
import { PettyCashFilesDialog } from "./PettyCashFilesDialog";

const PettyCashEditDialog = dynamic(
	() => import("../components/PettyCashEditDialog"),
);

function prepareFilters(searchTerm: string, searchByUser: UserLookup | null) {
	let filters: PettyCashQueryFilter = {};

	if (searchTerm) {
		filters.title = { $regex: searchTerm };
	}

	if (searchByUser) {
		filters.userId = searchByUser.id;
	}

	return filters;
}

const PettyCashList = () => {
	const dialog = useDialogs();

	// search
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [searchByUser, setSearchByUser] = useState<UserLookup | null>(null);

	// data
	const fetchData = useCallback(
		async (page: number, pageSize: number) => {
			const categories = await getPettyCash({
				filters: prepareFilters(searchTerm, searchByUser),
				pagination: { page, pageSize },
				populate: ["userId"],
				sort: { createdAt: "desc" },
			});
			return [categories.items, categories.total] as const;
		},
		[searchTerm, searchByUser],
	);

	const { items, isLoading, offset, Pagination, refetch } =
		usePagination(fetchData);

	// dialogs
	const handleAddPettyCashDialogOpen = useCallback(async () => {
		const result = await dialog.open(PettyCashAddDialog);
		if (result) {
			refetch();
		}
	}, [dialog, refetch]);

	const handleEditDialogOpen = useCallback(
		async (item: PettyCashApi) => {
			const result = await dialog.open(PettyCashEditDialog, { item });
			if (result) {
				refetch();
			}
		},
		[dialog, refetch],
	);

	const handleDeleteDialogOpen = useCallback(
		async (pettyCash: PettyCashApi) => {
			const result = await dialog.open(DeleteDialog, {
				title: pettyCash.title,
				onSubmit: async () => {
					await deletePettyCash(pettyCash.id);
					toast.success("تنخواه با موفقیت حذف شد.");
				},
				onError: () => {
					toast.error("خطای نامشخصی در هنگام حذف تنخواه رخ داد.");
				},
			});

			if (result) {
				refetch();
			}
		},
		[dialog, refetch],
	);

	const handleFilesDialogOpen = useCallback(
		async (pettyCash: PettyCashApi) => {
			await dialog.open(PettyCashFilesDialog, pettyCash.id);
		},
		[dialog],
	);

	// export
	const [isPending, setIsPending] = useState<boolean>(false);

	async function handleExport() {
		try {
			setIsPending(true);

			const blob = await getPettyCashReport({
				filters: prepareFilters(searchTerm, searchByUser),
				sort: { createdAt: "desc" },
			});

			await downloadBlob({ blob });
		} catch (err) {
			console.error(err);
			toast.error("خطای نامشخصی در هنگام دریافت گزارش تنخواه رخ داد.");
		} finally {
			setIsPending(false);
		}
	}

	return (
		<div className="col-span-full">
			<Card>
				<CardHeader orientation="horizontal">
					<CardTitle>فهرست تنخواه ها</CardTitle>

					<CardNav>
						<div className="min-w-40">
							<UserLookupSelect
								placeholder="جستجوی کاربر"
								value={searchByUser || null}
								onValueChange={(e) => {
									setSearchByUser(e);
								}}
							/>
						</div>

						<Input
							type="text"
							placeholder="جستجوی عنوان"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>

						<Button onClick={handleAddPettyCashDialogOpen} variant="primary">
							<FaUserPlus />
							<span>افزودن تنخواه</span>
						</Button>

						<Button
							disabled={isPending}
							type="button"
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
								<TableHead className="w-48">کاربر</TableHead>
								<TableHead className="w-48">عنوان</TableHead>
								<TableHead>توضیحات</TableHead>
								<TableHead className="w-40">اعتبار (ریال)</TableHead>
								<TableHead className="w-40">موجودی (ریال)</TableHead>
								<TableHead className="w-72">مراکز هزینه</TableHead>
								<TableHead className="w-32">عملیات</TableHead>
							</TableRow>
						</TableHeader>

						<TableBody>
							{items?.length ? (
								items.map((item, index) => (
									<TableRow key={item.id} className="whitespace-nowrap">
										<TableCell>
											<Numeric value={offset + index + 1} />
										</TableCell>

										<TableCell>
											{getUserFullname(asNavigationProp(item.userId))}
										</TableCell>

										<TableCell>{item.title}</TableCell>

										<TableCell>{item.description || "بدون توضیحات"}</TableCell>

										<TableCell>
											<Numeric value={toCurrency(String(item.amount))} />
										</TableCell>

										<TableCell>
											<Numeric value={toCurrency(String(item.remain))} />
										</TableCell>

										<TableCell className="relative flex gap-2">
											{item.categoryIds.length <= 1 ? (
												asNavigationProp(item.categoryIds)
													.map((x) => x.title)
													.join("، ")
											) : (
												<Popover>
													<PopoverTrigger asChild>
														<div className="flex cursor-pointer">
															{asNavigationProp(item.categoryIds)
																.slice(0, 3)
																.filter((x) => x.isDeleted === false)
																.map((x) => x.title)
																.join("، ")}
															<span>، ...</span>
														</div>
													</PopoverTrigger>
													<PopoverContent className="flex flex-col gap-1">
														{asNavigationProp(item.categoryIds)
															.filter((x) => x.isDeleted === false)
															.map((x) => (
																<div key={x.id}>{x.title}</div>
															))}
													</PopoverContent>
												</Popover>
											)}
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
																		handleEditDialogOpen(item);
																	}}
																>
																	<FaPenToSquare />
																</Button>
															</TooltipTrigger>
															<TooltipContent>ویرایش تنخواه</TooltipContent>
														</TableAction>
													</Tooltip>

													<TableAction>
														<DropdownMenu>
															<DropdownMenuTrigger className="h-full">
																<FaEllipsis />
															</DropdownMenuTrigger>
															<DropdownMenuContent className="min-w-40">
																<DropdownMenuItem
																	className="flex items-center gap-2"
																	onSelect={() => handleFilesDialogOpen(item)}
																>
																	<FaFolderOpen />
																	<span>پیوست ها</span>
																</DropdownMenuItem>
																<DropdownMenuItem
																	className="flex items-center gap-2"
																	onSelect={() => handleDeleteDialogOpen(item)}
																>
																	<FaTrash />
																	<span>حذف تنخواه</span>
																</DropdownMenuItem>
															</DropdownMenuContent>
														</DropdownMenu>
													</TableAction>
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

export { PettyCashList };
