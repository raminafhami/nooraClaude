"use client";

import moment from "jalali-moment";
import { useCallback, useEffect, useState } from "react";
import { FaDownload, FaMagnifyingGlass } from "react-icons/fa6";
import { toast } from "sonner";

import { useTableStore } from "@/cache/store/tableStore";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardNav, CardTitle } from "@/components/ui/card";
import { useDialogs } from "@/components/ui/dialog/use-dialogs";
import { usePagination } from "@/components/ui/pagination/usePagination";
import { InstanceStatus } from "@/felo/instances/enums/InstanceStatus";
import { InstanceQueryFilter } from "@/felo/instances/models/InstanceQuery";
import { getInstances } from "@/felo/instances/services/getInstances";
import { zeroDateTimeString } from "@/utils/date/zeroDateTimeString";
import downloadBlob from "@/utils/downloadBlob";

import { InvoiceItem } from "../../flows/invoice-payment/models/InvoiceItem";
import { getInvoicePaymentInstanceReport } from "../../services/getInvoicePaymentInstanceReport";
import { getInvoices } from "../../services/getInvoices";
import { parseInvoice } from "../../utils/parseInvoice";
import { InvoicePaymentFilterBar } from "./InvoicePaymentFilterBar";
import { InvoicePaymentFilterDialog } from "./InvoicePaymentFilterDialog";
import {
	InvoicePaymentFilterArgs,
	InvoicePaymentItemType,
} from "./InvoicePaymentList.types";
import { InvoicePaymentTable } from "./InvoicePaymentTable";

const LIST_CACHE_KEY = "InvoicePaymentInstanceList";

function InvoicePaymentList() {
	const dialogs = useDialogs();

	// cache
	const { setTableData, getTableData } = useTableStore();
	const cachedData = getTableData(LIST_CACHE_KEY);

	// search
	const [filterArgs, setFilterArgs] = useState<InvoicePaymentFilterArgs>(
		cachedData?.filters ?? {},
	);

	const handleSearchDialogOpen = useCallback(async () => {
		const result = await dialogs.open(InvoicePaymentFilterDialog, filterArgs);

		if (result) {
			setFilterArgs(result);
		}
	}, [dialogs, filterArgs]);

	// data
	const instanceQueryFn = useCallback(
		async (page: number, pageSize: number) => {
			const instances = await getInstances({
				filters: prepareFilters(filterArgs),
				sort: { updatedAt: "desc" },
				page: { no: page, size: pageSize },
				props: [
					"Assignees",
					"InvoiceItems",
					"PaymentType",
					"PaymentAmount",
					"PaymentDate",
					"BankAccount",
					"ReceiptNo",
					"ForeignAccount",
					"VoucherNo",
					"InformationFormStatus",
				],
			});

			const invoiceIds: string[] = Array.from(
				new Set(
					instances.items.flatMap((x) =>
						x.parameters["InvoiceItems"]?.map((y: InvoiceItem) => y.id),
					),
				),
			);

			const invoices = await getInvoices({
				filters: { _id: invoiceIds },
			}).then(parseInvoice);

			const result = instances.items.map<InvoicePaymentItemType>((x) => ({
				instance: x,
				invoices: invoices.filter((y) =>
					x.parameters["InvoiceItems"]
						?.map((y: InvoiceItem) => y.id)
						.includes(y.id),
				),
			}));

			return [result, instances.total] as const;
		},
		[filterArgs],
	);

	const { error, isLoading, items, offset, page, pageSize, Pagination } =
		usePagination<InvoicePaymentItemType>(
			instanceQueryFn,
			cachedData?.page,
			cachedData?.size,
		);

	useEffect(() => {
		setTableData({
			tableName: LIST_CACHE_KEY,
			page: page,
			size: pageSize,
			data: items,
			filters: filterArgs,
		});
	}, [items, page, pageSize, filterArgs, setTableData]);

	// export
	const [isPending, setIsPending] = useState<boolean>(false);

	async function handleExport() {
		try {
			setIsPending(true);

			const blob = await getInvoicePaymentInstanceReport({
				filters: prepareFilters(filterArgs),
			});

			await downloadBlob({ blob });
		} catch (err) {
			console.error(err);
			toast.error("خطای نامشخصی در هنگام دریافت گزارش رخ داد.");
		} finally {
			setIsPending(false);
		}
	}

	const disabled = isLoading || isPending;

	return (
		<Card>
			<CardHeader orientation="horizontal">
				<CardTitle>فهرست پرداختی فاکتورها</CardTitle>
				<CardNav>
					<Button
						disabled={disabled}
						type="button"
						onClick={handleSearchDialogOpen}
					>
						<FaMagnifyingGlass />
						<span>جستجو</span>
					</Button>

					<Button
						disabled={disabled}
						type="button"
						variant="secondary"
						onClick={handleExport}
					>
						<FaDownload />
						<span>دریافت گزارش اکسل</span>
					</Button>
				</CardNav>
			</CardHeader>

			<InvoicePaymentFilterBar
				disabled={disabled}
				filterArgs={filterArgs}
				onFilterArgsUpdate={setFilterArgs}
			/>

			<InvoicePaymentTable
				error={error}
				items={items}
				loading={isLoading}
				offset={offset}
				pagination={<Pagination />}
			/>
		</Card>
	);
}

function prepareFilters(filterArgs: InvoicePaymentFilterArgs) {
	const filters: InstanceQueryFilter[] = [
		{ name: "processDefinitionKey", value: "Financial_Invoice_Payment" },
		{ name: "status", value: InstanceStatus.Completed },
	];

	const $andFilter: Record<string, any>[] = [];

	if (filterArgs.creator) {
		filters.push({
			name: "parameters.Assignees.creator.id",
			value: filterArgs.creator.id,
		});
	}

	if (filterArgs.paymentType) {
		filters.push({
			name: "parameters.PaymentType",
			value: filterArgs.paymentType,
		});

		if (filterArgs.bankAccount) {
			const values = filterArgs.bankAccount.includes("::")
				? [filterArgs.bankAccount, filterArgs.bankAccount.split("::")[1]]
				: [filterArgs.bankAccount];

			filters.push({
				name: "parameters.BankAccount",
				value: { $in: values },
			});
		}

		if (filterArgs.receiptNo) {
			filters.push({
				name: "parameters.ReceiptNo",
				value: { $regex: filterArgs.receiptNo, $options: "i" },
			});
		}

		if (filterArgs.foreignAccount) {
			filters.push({
				name: "parameters.ForeignAccount",
				value: filterArgs.foreignAccount,
			});
		}
	}

	if (filterArgs.paymentDateFrom) {
		$andFilter.push({
			"parameters.PaymentDate": {
				$gte: filterArgs.paymentDateFrom,
			},
		});
	}

	if (filterArgs.paymentDateTo) {
		$andFilter.push({
			"parameters.PaymentDate": {
				$lt: filterArgs.paymentDateTo,
			},
		});
	}

	if (filterArgs.caseNo) {
		filters.push({
			name: "parameters.InvoiceItems",
			value: {
				$elemMatch: { caseNos: filterArgs.caseNo },
			},
		});
	}

	if (filterArgs.voucherNo) {
		filters.push({
			name: "parameters.VoucherNo",
			value: filterArgs.voucherNo,
		});
	}

	if (filterArgs.voucherEntryBy) {
		filters.push({
			name: "parameters.InformationFormStatus",
			value:
				filterArgs.voucherEntryBy === "creator"
					? "auto-document"
					: { $ne: "auto-document" },
		});
	}

	if (filterArgs.dateFrom) {
		$andFilter.push({
			updatedAt: {
				$gte: zeroDateTimeString(moment(filterArgs.dateFrom, "jYYYY/jMM/jDD")),
			},
		});
	}

	if (filterArgs.dateTo) {
		$andFilter.push({
			updatedAt: {
				$lt: zeroDateTimeString(
					moment(filterArgs.dateTo, "jYYYY/jMM/jDD").add(1, "day"),
				),
			},
		});
	}

	if ($andFilter.length) {
		filters.push({ name: "$and", value: $andFilter });
	}

	return filters;
}

export { InvoicePaymentList };
