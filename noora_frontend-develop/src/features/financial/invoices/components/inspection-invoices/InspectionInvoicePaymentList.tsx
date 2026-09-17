"use client";

import { useCallback } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePagination } from "@/components/ui/pagination/usePagination";
import { InstanceStatus } from "@/felo/instances/enums/InstanceStatus";
import { InstanceQueryFilter } from "@/felo/instances/models/InstanceQuery";
import { getInstances } from "@/felo/instances/services/getInstances";

import { InvoiceItem } from "../../flows/invoice-payment/models/InvoiceItem";
import { getInvoices } from "../../services/getInvoices";
import { parseInvoice } from "../../utils/parseInvoice";
import { InvoicePaymentItemType } from "../invoice-payment-list/InvoicePaymentList.types";
import { InvoicePaymentTable } from "../invoice-payment-list/InvoicePaymentTable";

function InspectionInvoicePaymentList({ caseNo }: { caseNo: string }) {
	const instanceQueryFn = useCallback(
		async (page: number, pageSize: number) => {
			const filters: InstanceQueryFilter[] = [
				{ name: "processDefinitionKey", value: "Financial_Invoice_Payment" },
				{ name: "status", value: InstanceStatus.Completed },
			];

			filters.push({
				name: "parameters.InvoiceItems",
				value: {
					$elemMatch: { caseNos: caseNo },
				},
			});

			const instances = await getInstances({
				filters,
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
		[caseNo],
	);

	const { error, isLoading, items, offset, Pagination } =
		usePagination<InvoicePaymentItemType>(instanceQueryFn);

	return (
		<Card>
			<CardHeader orientation="horizontal">
				<CardTitle>فهرست پرداختی فاکتورها</CardTitle>
			</CardHeader>

			<CardContent className="px-0">
				<InvoicePaymentTable
					error={error}
					items={items}
					loading={isLoading}
					offset={offset}
					pagination={<Pagination />}
				/>
			</CardContent>
		</Card>
	);
}

export { InspectionInvoicePaymentList };
