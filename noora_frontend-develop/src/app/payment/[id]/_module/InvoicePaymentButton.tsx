"use client";

import { useCallback, useState } from "react";
import { FaMoneyBill } from "react-icons/fa6";
import { toast } from "sonner";

import apiClient from "@/api/client";
import { isApiResponse } from "@/api/utils/isApiResponse";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { isLockedIncomeErrorMessage } from "@/financial/incomes/utils/isLockedIncomeErrorMessage";
import { InvoiceStatus } from "@/financial/invoices/enums/InvoiceStatus";
import { Invoice } from "@/financial/invoices/models/Invoice";
import { isLockedInvoiceErrorMessage } from "@/financial/invoices/utils/isLockedInvoiceErrorMessage";

function InvoicePaymentButton({
	invoice,
	encryptedId,
}: {
	invoice: Invoice;
	encryptedId: string;
}) {
	const [isPending, setIsPending] = useState<boolean>(false);

	const handleClick = useCallback(async () => {
		try {
			setIsPending(true);

			const response = await apiClient.send({
				method: "post",
				url: `payment/pay/${encryptedId}`,
				responseType: "text",
			});

			const parser = new DOMParser();
			const doc = parser.parseFromString(response, "text/html");
			const tokenElement: any = doc.getElementsByName("tokenIdentity")[0];
			const token: string | null = tokenElement?.value || null;

			if (!token) throw new Error();

			const form = document.createElement("form");
			form.method = "post";
			form.action = "https://ikc.shaparak.ir/iuiv3/IPG/Index/";
			form.enctype = "multipart/form-data";
			form.style.display = "none";

			const input = document.createElement("input");
			input.type = "hidden";
			input.name = "tokenIdentity";
			input.value = token;

			form.appendChild(input);

			document.body.appendChild(form);
			form.submit();
		} catch (err: any) {
			console.error(err);

			let errorMessage: string | undefined;
			if (isApiResponse(err)) {
				if (
					isLockedIncomeErrorMessage(err) ||
					isLockedInvoiceErrorMessage(err)
				) {
					errorMessage = "امکان انجام این عملیات وجود ندارد.";
				} else if (err.message === "Invoice is not payable") {
					errorMessage = "امکان انجام این عملیات وجود ندارد.";
				}
			}

			toast.error(
				errorMessage || "خطای نامشخصی در هنگام دریافت اطلاعات رخ داد.",
			);
		} finally {
			setIsPending(false);
		}
	}, [encryptedId]);

	if (
		[
			InvoiceStatus.Pending,
			InvoiceStatus.Paid,
			InvoiceStatus.Cancelled,
		].includes(invoice.status)
	) {
		return null;
	}

	return (
		<Button
			className="min-w-full xs:min-w-24"
			disabled={isPending}
			onClick={handleClick}
		>
			<Spinner loading={isPending} size="xs">
				<FaMoneyBill />
			</Spinner>
			<span>پرداخت {invoice.issueNo ? "فاکتور" : "پیش فاکتور"}</span>
		</Button>
	);
}

export { InvoicePaymentButton };
