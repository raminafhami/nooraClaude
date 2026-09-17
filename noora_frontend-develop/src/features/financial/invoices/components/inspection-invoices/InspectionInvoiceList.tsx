"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";
import {
	FaBan,
	FaBoltLightning,
	FaDownload,
	FaEllipsis,
	FaEye,
	FaFileContract,
	FaMessage,
	FaPenToSquare,
} from "react-icons/fa6";
import { toast } from "sonner";

import { isApiResponse } from "@/api/utils/isApiResponse";
import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { getBuyerById } from "@/buyers/services/getBuyerById";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardNav,
	CardTitle,
} from "@/components/ui/card";
import { DateTime } from "@/components/ui/datetime";
import { useDialogs } from "@/components/ui/dialog/use-dialogs";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { getInstanceById } from "@/felo/instances/services/getInstanceById";
import { IncomeStatus } from "@/financial/incomes/enums/IncomeStatus";
import { getIncomes } from "@/financial/incomes/services/getIncomes";
import { isLockedIncomeErrorMessage } from "@/financial/incomes/utils/isLockedIncomeErrorMessage";
import { InvoiceForceEditDialog } from "@/financial/invoices/components/invoice-force-edit/InvoiceForceEditDialog";
import { UserLookup } from "@/identity/users/models/UserLookup";
import getUserById from "@/identity/users/services/getUserById";
import { CaseType } from "@/inspection/models/CaseType";
import { toCurrency } from "@/utils/String";

import {
	InvoiceListContext,
	InvoiceListContextType,
	useInvoiceListContext,
} from "../../contexts/InvoiceListContext";
import { InvoiceServiceType } from "../../enums/InvoiceServiceType";
import { InvoiceStatus } from "../../enums/InvoiceStatus";
import { InvoiceType, invoiceType } from "../../enums/InvoiceType";
import { Invoice } from "../../models/Invoice";
import { InvoiceRecipient } from "../../models/InvoiceRecipient";
import { createInvoice } from "../../services/createInvoice";
import { getInstanceInvoices } from "../../services/getInstanceInvoices";
import { issueInvoice } from "../../services/issueInvoice";
import { isLockedInvoiceErrorMessage } from "../../utils/isLockedInvoiceErrorMessage";
import { parseInvoice } from "../../utils/parseInvoice";
import { InvoiceCancelDialog } from "../invoice-cancel/InvoiceCancelDialog";
import { InvoiceExportDialog } from "../invoice-export/InvoiceExportDialog";
import { InvoiceUpsertDialog } from "../invoice-upsert/InvoiceUpsertDialog";
import { InvoiceViewDialog } from "../invoice-view/InvoiceViewDialog";
import { InvoiceExpiryAt } from "../InvoiceExpiryAt";
import { InvoiceStatusBadge } from "../InvoiceStatusBadge";

const InvoiceSendDialog = dynamic(
	() => import("../invoice-send/InvoiceSendDialog"),
);

function InspectionInvoiceList({ instanceId }: { instanceId: string }) {
	const queryFn = useCallback(async () => {
		const invoices = await getInstanceInvoices(instanceId, {
			sort: { createdAt: "desc" },
			populate: ["items", "createdBy", "updatedBy", "issuedBy"],
		});

		return [parseInvoice(invoices), invoices.length] as const;
	}, [instanceId]);

	const { items, isLoading, error, offset, page, refetch } =
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

	const [isQuickCreate, setIsQuickCreate] = useState<boolean>(false);

	async function handleQuickCreateClick(instanceId: string) {
		try {
			setIsQuickCreate(true);

			const instance = await getInstanceById(instanceId, [
				"Assignees",
				"Branch",
				"Buyer",
				"BuyerData",
				"CaseType",
			]);

			const caseType = instance.parameters["CaseType"] ?? CaseType.Official;

			const recipient: InvoiceRecipient = await (async () => {
				if (caseType === CaseType.Official) {
					const buyerId =
						instance.parameters["Buyer"]?.id ??
						instance.parameters["BuyerData"]?.id;
					const buyer = await getBuyerById(buyerId);

					if (!buyer) {
						throw new Error();
					}

					return {
						refId: buyer?.id,
						name: buyer.name.trim() || buyer.nameEn.trim(),
						nationalCode: buyer.nationalCode,
						economicCode: buyer.nationalCode,
						registrationNo: buyer.registrationNo || undefined,
						postalCode: buyer.postalCode,
						phone: buyer.phoneNo || undefined,
						fax: buyer.faxNo || undefined,
						address: buyer.address,
					};
				} else {
					const userId =
						instance.parameters["Branch"]?.managerId ??
						instance.parameters["Assignees"]?.customer?.id;
					const user = await getUserById(userId);

					return {
						refId: user?.id,
						name: user.firstname,
						lastname: user.lastname,
						nationalCode: user.nationalCode || undefined,
						economicCode: user.nationalCode || undefined,
						phone: user.phoneNo || undefined,
					};
				}
			})();

			const incomes = await getIncomes({
				filters: {
					instanceId: instance.id,
					status: IncomeStatus.Unpaid,
					isDeleted: false,
				},
			});

			if (!incomes.length) {
				toast.info("هیچ درآمد پرداخت نشده ای جهت ایجاد فاکتور وجود ندارد.");
				return;
			}

			await createInvoice({
				type: undefined,
				title: "صورت حساب فروش کالا و خدمات",
				recipient: recipient,
				incomeIds: incomes.map((x) => x.id),
				description: "",
			});

			toast.success("فاکتور مورد نظر با موفقیت ایجاد شد.");

			refetch();
		} catch (err: any) {
			console.error(err);
			toast.error("خطای نامشخصی در هنگام ثبت اطلاعات رخ داد.");
		} finally {
			setIsQuickCreate(true);
		}
	}

	return (
		<>
			<InvoiceListContext.Provider value={ctxValue}>
				<Card>
					<CardHeader orientation="horizontal">
						<CardTitle>لیست فاکتورها</CardTitle>
						<CardNav>
							<Button
								disabled={isQuickCreate}
								type="button"
								onClick={() => handleQuickCreateClick(instanceId)}
							>
								<FaBoltLightning />
								<span>ایجاد سریع پیش فاکتور</span>
							</Button>
						</CardNav>
					</CardHeader>

					<CardContent className="px-0">
						<InvoiceTable items={items} loading={isLoading} offset={offset} />
					</CardContent>
				</Card>
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
}: {
	items: Invoice[];
	loading: boolean;
	offset: number;
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
				slotProps={{ root: { className: "rounded-none border-x-0" } }}
			>
				<TableHeader>
					<TableRow className="whitespace-nowrap">
						{/* <TableHead className="w-16">#</TableHead> */}
						<TableHead className="w-24">شناسه</TableHead>
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
					{items.length !== 0 ? (
						items.map((invoice, index) => (
							<InvoiceItem
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

function InvoiceItem({
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
				<InvoiceItemHistoryInfo user={item.createdBy} date={item.createdAt} />
			</TableCell>
			<TableCell>
				<InvoiceItemHistoryInfo user={item.updatedBy} date={item.updatedAt} />
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

function InvoiceItemHistoryInfo({
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

export { InspectionInvoiceList };
