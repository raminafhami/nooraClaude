"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";
import {
	FaBan,
	FaDownload,
	FaEllipsis,
	FaEye,
	FaFileContract,
	FaMessage,
	FaPenToSquare,
	FaPlus,
} from "react-icons/fa6";
import { toast } from "sonner";

import { isApiResponse } from "@/api/utils/isApiResponse";
import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DateTime } from "@/components/ui/datetime";
import { useDialogs } from "@/components/ui/dialog/use-dialogs";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePagination } from "@/components/ui/pagination/usePagination";
import { Separator } from "@/components/ui/separator";
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
import { isLockedIncomeErrorMessage } from "@/financial/incomes/utils/isLockedIncomeErrorMessage";
import { InvoiceCancelDialog } from "@/financial/invoices/components/invoice-cancel/InvoiceCancelDialog";
import { InvoiceExportDialog } from "@/financial/invoices/components/invoice-export/InvoiceExportDialog";
import { InvoiceForceEditDialog } from "@/financial/invoices/components/invoice-force-edit/InvoiceForceEditDialog";
import { InvoiceManualCreateDialog } from "@/financial/invoices/components/invoice-manual-create/InvoiceManualCreateDialog";
import { InvoiceUpsertDialog } from "@/financial/invoices/components/invoice-upsert/InvoiceUpsertDialog";
import { InvoiceViewDialog } from "@/financial/invoices/components/invoice-view/InvoiceViewDialog";
import { InvoiceExpiryAt } from "@/financial/invoices/components/InvoiceExpiryAt";
import { InvoiceStatusBadge } from "@/financial/invoices/components/InvoiceStatusBadge";
import {
	InvoiceListContext,
	InvoiceListContextType,
	useInvoiceListContext,
} from "@/financial/invoices/contexts/InvoiceListContext";
import { InvoiceServiceType } from "@/financial/invoices/enums/InvoiceServiceType";
import { InvoiceStatus } from "@/financial/invoices/enums/InvoiceStatus";
import {
	InvoiceType,
	invoiceType,
} from "@/financial/invoices/enums/InvoiceType";
import { Invoice } from "@/financial/invoices/models/Invoice";
import { InvoiceQueryFilter } from "@/financial/invoices/models/InvoiceQuery";
import { getInvoices } from "@/financial/invoices/services/getInvoices";
import { issueInvoice } from "@/financial/invoices/services/issueInvoice";
import { isLockedInvoiceErrorMessage } from "@/financial/invoices/utils/isLockedInvoiceErrorMessage";
import { parseInvoice } from "@/financial/invoices/utils/parseInvoice";
import { UserLookup } from "@/identity/users/models/UserLookup";
import { Head } from "@/ui/Head";
import { toCurrency } from "@/utils/String";

import { InvoiceListFilter } from "./InvoiceListFilter";

const InvoiceSendDialog = dynamic(
	() =>
		import("@/financial/invoices/components/invoice-send/InvoiceSendDialog"),
);

function InvoiceList() {
	const dialogs = useDialogs();
	const { identity, isAuthorized } = useLoggedInUser();

	const canSeeAll = useMemo<boolean>(
		() =>
			isAuthorized({
				groups: ["ceo", "financial-expert", "financial-assistant"],
			}),
		[isAuthorized],
	);

	const canCreateManualInvoice = useMemo<boolean>(
		() =>
			isAuthorized({
				groups: ["financial-expert", "financial-assistant"],
			}),
		[isAuthorized],
	);

	const [queryFilters, setQueryFilters] = useState<{
		invoiceNo: string;
		issueNo: string;
		recipient: string;
		status: InvoiceStatus | null;
		type: InvoiceType | null;
	}>({
		invoiceNo: "",
		issueNo: "",
		recipient: "",
		status: null,
		type: null,
	});

	const queryFn = useCallback(
		async (page: number, pageSize: number) => {
			const filters: InvoiceQueryFilter = {};

			if (!canSeeAll) {
				filters.createdBy = identity.id;
			}

			const invoiceNoSearchTerm = queryFilters.invoiceNo.trim();
			if (invoiceNoSearchTerm) {
				filters.invoiceNo = invoiceNoSearchTerm;
			}

			const issueNoSearchTerm = queryFilters.issueNo.trim();
			if (issueNoSearchTerm) {
				filters.issueNo = issueNoSearchTerm;
			}

			if (queryFilters.recipient) {
				filters["recipient.name"] = {
					$regex: queryFilters.recipient,
					$options: "i",
				};
			}

			if (queryFilters.status) {
				filters.status = queryFilters.status;
			}

			if (queryFilters.type) {
				filters.type = queryFilters.type;
			}

			const invoices = await getInvoices({
				filters,
				sort: { createdAt: "desc" },
				populate: ["items", "createdBy", "updatedBy", "issuedBy"],
				pagination: { page, pageSize },
			});

			return [parseInvoice(invoices.items), invoices.total] as const;
		},
		[
			canSeeAll,
			identity.id,
			queryFilters.recipient,
			queryFilters.invoiceNo,
			queryFilters.issueNo,
			queryFilters.status,
			queryFilters.type,
		],
	);

	const { items, isLoading, offset, page, refetch, Pagination } =
		usePagination<Invoice>(queryFn);

	const [isPending, setIsPending] = useState<boolean>(false);

	const handleInvoiceIssue = useCallback(
		async (invoice: Invoice) => {
			try {
				setIsPending(true);

				await issueInvoice(invoice.id);
				refetch(page);
			} catch (err: any) {
				console.error(err);

				let errorMessage: string | undefined;
				if (isApiResponse(err)) {
					if (err?.message === "Recipient information is not completed") {
						errorMessage =
							"صدور فاکتور به دلیل ناقص بودن اطلاعات گیرنده فاکتور امکان پذیر نیست.";
					} else if (
						isLockedIncomeErrorMessage(err) ||
						isLockedInvoiceErrorMessage(err)
					) {
						errorMessage = "امکان انجام این عملیات وجود ندارد.";
					}
				}

				toast.error(
					errorMessage || "خطای نامشخصی در هنگام ثبت اطلاعات رخ داد.",
				);
			} finally {
				setIsPending(false);
			}
		},
		[page, refetch],
	);

	// upsert dialog
	const [upsertOpen, setUpsertOpen] = useState<boolean>(false);
	const [upsertPayload, setUpsertPayload] = useState<
		Partial<{
			invoice: Invoice;
			serviceType: InvoiceServiceType;
		}>
	>({ serviceType: InvoiceServiceType.Standard });

	const handleUpsertDialogOpen = useCallback(
		({
			invoice,
			serviceType,
		}: {
			invoice?: Invoice;
			serviceType?: InvoiceServiceType;
		}) => {
			setUpsertOpen(true);
			setUpsertPayload({ invoice, serviceType });
		},
		[],
	);

	const handleUpsertDialogClose = useCallback(
		(result?: boolean) => {
			setUpsertOpen(false);

			if (result) {
				refetch();
			}
		},
		[refetch],
	);

	const handleEditDialogOpen = useCallback(
		(invoice: Invoice) => {
			handleUpsertDialogOpen({ invoice });
		},
		[handleUpsertDialogOpen],
	);

	// manual invoice dialog
	async function handleManualCreateDialogOpen() {
		const result = await dialogs.open(InvoiceManualCreateDialog);
		if (result) refetch();
	}

	// force edit dialog
	const [forceEditOpen, setForceEditOpen] = useState<boolean>(false);
	const [forceEditPayload, setForceEditPayload] = useState<{
		invoice?: Invoice;
	}>({});

	const handleForceEditDialogOpen = useCallback((invoice: Invoice) => {
		setForceEditOpen(true);
		setForceEditPayload({ invoice });
	}, []);

	const handleForceEditDialogClose = useCallback(
		(result?: boolean) => {
			setForceEditOpen(false);

			if (result) {
				refetch();
			}
		},
		[refetch],
	);

	// cancel dialog
	const [cancelOpen, setCancelOpen] = useState<boolean>(false);
	const [cancelPayload, setCancelPayload] = useState<{
		invoice: Invoice;
	}>({} as any);

	const handleCancelDialogOpen = useCallback((invoice: Invoice) => {
		setCancelOpen(true);
		setCancelPayload({ invoice });
	}, []);

	const handleCancelDialogClose = useCallback(
		(result?: boolean) => {
			setCancelOpen(false);

			if (result) {
				refetch(page);
			}
		},
		[page, refetch],
	);

	const ctxValue = useMemo<InvoiceListContextType>(
		() => ({
			isPending,
			editInvoice: handleEditDialogOpen,
			forceEditInvoice: handleForceEditDialogOpen,
			issueOne: handleInvoiceIssue,
			cancelOne: handleCancelDialogOpen,
		}),
		[
			isPending,
			handleEditDialogOpen,
			handleForceEditDialogOpen,
			handleInvoiceIssue,
			handleCancelDialogOpen,
		],
	);

	return (
		<>
			<InvoiceListContext.Provider value={ctxValue}>
				<div className="space-y-8">
					<Head.Root>
						<Head.Title>لیست فاکتورها</Head.Title>
						<Head.Nav className="sm:ms-auto">
							{canCreateManualInvoice && (
								<>
									<Button
										variant="primary"
										onClick={handleManualCreateDialogOpen}
									>
										<FaPlus />
										<span>ایجاد فاکتور دستی</span>
									</Button>

									<Separator className="h-8 w-0.5" orientation="vertical" />
								</>
							)}

							<Button
								disabled={isPending}
								variant="primary"
								onClick={() =>
									handleUpsertDialogOpen({
										serviceType: InvoiceServiceType.Standard,
									})
								}
							>
								<FaPlus />
								<span>ایجاد فاکتور آزاد</span>
							</Button>

							<Button
								disabled={isPending}
								variant="primary"
								onClick={() =>
									handleUpsertDialogOpen({
										serviceType: InvoiceServiceType.Inspection,
									})
								}
							>
								<FaPlus />
								<span>ایجاد فاکتور بازرسی</span>
							</Button>
						</Head.Nav>
					</Head.Root>

					<Card>
						<CardContent className="px-0 pt-6">
							<InvoiceListFilter
								queryFilters={queryFilters}
								setQueryFilters={setQueryFilters}
							/>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="px-0 pt-6">
							<InvoiceTable
								items={items}
								loading={isLoading}
								offset={offset}
								pagination={<Pagination />}
							/>
						</CardContent>
					</Card>
				</div>
			</InvoiceListContext.Provider>

			<InvoiceUpsertDialog
				payload={upsertPayload}
				open={upsertOpen}
				onClose={handleUpsertDialogClose}
			/>

			<InvoiceForceEditDialog
				payload={forceEditPayload}
				open={forceEditOpen}
				onClose={handleForceEditDialogClose}
			/>

			<InvoiceCancelDialog
				payload={cancelPayload.invoice?.id}
				open={cancelOpen}
				onClose={handleCancelDialogClose}
			/>
		</>
	);
}

function InvoiceTable({
	items,
	loading,
	offset,
	pagination,
}: {
	items: Invoice[];
	loading: boolean;
	offset: number;
	pagination: React.ReactNode;
}) {
	const { isAuthorized } = useLoggedInUser();
	const isAccountingTeam = isAuthorized({
		groups: ["financial-expert", "financial-assistant"],
	});

	const [viewOpen, setViewOpen] = useState<boolean>(false);
	const [viewPayload, setViewPayload] = useState<{
		invoice: Invoice;
	}>({} as any);

	const handleViewDialogOpen = useCallback((invoice: Invoice) => {
		setViewOpen(true);
		setViewPayload({ invoice });
	}, []);

	const handleViewDialogClose = useCallback(() => {
		setViewOpen(false);
	}, []);

	const [exportOpen, setExportOpen] = useState<boolean>(false);
	const [exportPayload, setExportPayload] = useState<
		Pick<Invoice, "id" | "invoiceNo" | "issueNo">
	>({} as any);

	const handleExportDialogOpen = useCallback(
		(payload: Pick<Invoice, "id" | "invoiceNo" | "issueNo">) => {
			setExportPayload(payload);
			setExportOpen(true);
		},
		[],
	);

	const handleExportDialogClose = useCallback(() => {
		setExportOpen(false);
	}, []);

	return (
		<>
			<Table
				loading={loading}
				pagination={pagination}
				slotProps={{ root: { className: "rounded-none border-x-0" } }}
			>
				<TableHeader>
					<TableRow className="whitespace-nowrap">
						{/* <TableHead className="w-16">#</TableHead> */}
						<TableHead className="w-24">شناسه</TableHead>
						<TableHead className="w-64">عنوان</TableHead>
						<TableHead>گیرنده</TableHead>
						<TableHead className="w-36">وضعیت</TableHead>
						<TableHead className="w-36">نوع فاکتور</TableHead>
						<TableHead className="w-40">مبلغ (ریال)</TableHead>
						<TableHead className="w-40">تاریخ انقضا</TableHead>
						<TableHead className="w-48">وضعیت صدور</TableHead>
						<TableHead className="w-40">زمان ایجاد</TableHead>
						<TableHead className="w-40">آخرین بروزرسانی</TableHead>
						<TableHead className="w-36">عملیات</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{items.length ? (
						items.map((invoice, index) => (
							<InvoiceRow
								key={invoice.id}
								item={invoice}
								index={offset + index}
								accounting={isAccountingTeam}
								onView={handleViewDialogOpen}
								onExport={handleExportDialogOpen}
							/>
						))
					) : (
						<TableRow>
							<TableCell colSpan={100}>هیچ موردی یافت نشد.</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>

			<InvoiceViewDialog
				payload={viewPayload}
				open={viewOpen}
				onClose={handleViewDialogClose}
			/>

			<InvoiceExportDialog
				payload={exportPayload}
				open={exportOpen}
				onClose={handleExportDialogClose}
			/>
		</>
	);
}

function InvoiceRow({
	item,
	index,
	accounting,
	onView,
	onExport,
}: {
	item: Invoice;
	index: number;
	accounting: boolean;
	onView: (invoice: Invoice) => void;
	onExport: (payload: Pick<Invoice, "id" | "invoiceNo" | "issueNo">) => void;
}) {
	const dialog = useDialogs();

	const { isPending, editInvoice, forceEditInvoice, issueOne, cancelOne } =
		useInvoiceListContext();

	const canDownload =
		item.type === InvoiceType.Official &&
		(!(item.issueNo && item.issuedAt && item.issuedById) ||
			(item.issueNo && item.issuedAt && item.issuedById));
	const canEdit = editInvoice && item.status === InvoiceStatus.Active;
	const canForceEdit =
		forceEditInvoice &&
		accounting &&
		[InvoiceStatus.Pending, InvoiceStatus.Issued, InvoiceStatus.Paid].includes(
			item.status,
		);
	const canIssue =
		item.status === InvoiceStatus.Active &&
		item.type === InvoiceType.Official &&
		!item.issueNo;
	const canSend = item.status !== InvoiceStatus.Cancelled;
	const canCancel = item.status === InvoiceStatus.Active;
	const hasOtherActions =
		canDownload || canEdit || canForceEdit || canIssue || canSend || canCancel;

	const handleSendSmsModalOpen = useCallback(
		async (id: string) => {
			await dialog.open(InvoiceSendDialog, { id });
		},
		[dialog],
	);

	return (
		<TableRow className="whitespace-nowrap">
			{/* <TableCell className="tracking-wide">{index + 1}</TableCell> */}
			<TableCell className="tracking-wide">{item.invoiceNo}</TableCell>
			<TableCell className="tracking-wide">
				{item.title || "بدون عنوان"}
			</TableCell>
			<TableCell>
				{`${item.recipient.name} ${item.recipient.lastname ?? ""}`.trim()}
			</TableCell>
			<TableCell>
				<InvoiceStatusBadge status={item.status} />
			</TableCell>
			<TableCell>{invoiceType[item.type]?.title}</TableCell>
			<TableCell className="tracking-wide">
				{toCurrency((item.total + item.tax).toString())}
			</TableCell>
			<TableCell>
				<InvoiceExpiryAt date={item.expiryAt} />
			</TableCell>
			<TableCell>
				{item.issueNo ? (
					<div className="space-y-2 text-xs">
						{item.issuedBy && <div>{item.issuedBy.name}</div>}
						<div>
							<span className="tracking-wide text-muted-foreground">
								شماره سپیدار:
							</span>{" "}
							{item.issueNo}
						</div>
						{item.issuedAt && (
							<div>
								<span className="text-muted-foreground">تاریخ:</span>{" "}
								{item.issuedAt.toLocaleDateString("fa-IR-u-nu-latn", {
									year: "numeric",
									month: "2-digit",
									day: "2-digit",
								})}
							</div>
						)}
					</div>
				) : (
					"پیش فاکتور"
				)}
			</TableCell>
			<TableCell>
				<InvoiceRowHistoryInfo user={item.createdBy} date={item.createdAt} />
			</TableCell>
			<TableCell>
				<InvoiceRowHistoryInfo user={item.updatedBy} date={item.updatedAt} />
			</TableCell>
			<TableCell>
				<TooltipProvider>
					<TableActions>
						<TableAction>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										className="size-full focus-within:text-blue-600 hover:text-blue-600 active:text-blue-600"
										disabled={isPending}
										size="icon"
										variant="link"
										onClick={() => onView(item)}
									>
										<FaEye />
									</Button>
								</TooltipTrigger>
								<TooltipContent>مشاهده فاکتور</TooltipContent>
							</Tooltip>
						</TableAction>

						{hasOtherActions && (
							<TableAction>
								<DropdownMenu>
									<DropdownMenuTrigger className="h-full">
										<FaEllipsis />
									</DropdownMenuTrigger>
									<DropdownMenuContent className="min-w-32">
										{canDownload && (
											<DropdownMenuItem
												className="flex items-center gap-2"
												onSelect={() => {
													onExport({
														id: item.id,
														invoiceNo: item.invoiceNo,
														issueNo: item.issueNo,
													});
												}}
											>
												<div className="flex grow items-center gap-2">
													<FaDownload />
													<span>خروجی فاکتور</span>
												</div>
											</DropdownMenuItem>
										)}

										{canEdit && (
											<DropdownMenuItem
												className="flex items-center gap-2"
												onSelect={() => {
													editInvoice(item);
												}}
											>
												<div className="flex grow items-center gap-2">
													<FaPenToSquare />
													<span>ویرایش فاکتور</span>
												</div>
											</DropdownMenuItem>
										)}

										{canForceEdit && (
											<DropdownMenuItem
												className="flex items-center gap-2"
												disabled={isPending}
												onSelect={() => {
													forceEditInvoice(item);
												}}
											>
												<div className="flex items-center gap-2">
													<FaPenToSquare />
													<span>ویرایش فاکتور (حسابداری)</span>
												</div>
											</DropdownMenuItem>
										)}

										{canIssue && (
											<DropdownMenuItem
												className="flex items-center gap-2"
												disabled={isPending}
												onSelect={async (event) => {
													try {
														await issueOne(item);
													} catch (err: any) {
														event.preventDefault();
													}
												}}
											>
												<div className="flex grow items-center gap-2">
													<FaFileContract />
													<span>صدور فاکتور</span>
												</div>
											</DropdownMenuItem>
										)}

										{canSend && (
											<DropdownMenuItem
												className="flex items-center gap-2"
												onSelect={() => {
													handleSendSmsModalOpen(item.id);
												}}
											>
												<FaMessage />
												<span>ارسال فاکتور با پیامک</span>
											</DropdownMenuItem>
										)}

										{canCancel && (
											<DropdownMenuItem
												className="flex items-center gap-2"
												disabled={isPending}
												onSelect={() => {
													cancelOne?.(item);
												}}
											>
												<div className="flex grow items-center gap-2">
													<FaBan />
													<span>لغو فاکتور</span>
												</div>
											</DropdownMenuItem>
										)}
									</DropdownMenuContent>
								</DropdownMenu>
							</TableAction>
						)}
					</TableActions>
				</TooltipProvider>
			</TableCell>
		</TableRow>
	);
}

function InvoiceRowHistoryInfo({
	user,
	date,
}: {
	user?: UserLookup;
	date: Date;
}) {
	return (
		<div className="space-y-2 text-xs">
			{user && <div>{user.name}</div>}
			<DateTime date={date} />
		</div>
	);
}

export { InvoiceList };
