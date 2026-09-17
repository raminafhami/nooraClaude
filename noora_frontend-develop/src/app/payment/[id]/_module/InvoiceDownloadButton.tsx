"use client";

import { useCallback, useState } from "react";
import { FaDownload } from "react-icons/fa6";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Invoice } from "@/financial/invoices/models/Invoice";
import { getInvoiceByEncryptedId } from "@/financial/invoices/services/getInvoiceByEncryptedId";
import { getInvoiceNoSequence } from "@/financial/invoices/utils/getInvoiceNoSequence";
import downloadBlob from "@/utils/downloadBlob";

function InvoiceDownloadButton({
	invoice: { invoiceNo, issueNo },
	encryptedId,
}: {
	invoice: Invoice;
	encryptedId: string;
}) {
	const [isPending, setIsPending] = useState<boolean>(false);

	const handleClick = useCallback(async () => {
		try {
			setIsPending(true);

			const blob = await getInvoiceByEncryptedId(encryptedId, {
				download: "pdf",
			});

			const filename = `${getInvoiceNoSequence(invoiceNo)} ${issueNo ? "فاکتور" : "پیش فاکتور"}`;

			await downloadBlob({
				blob,
				filename,
			});
		} catch (err) {
			console.error(err);
			toast.error("خطای نامشخصی در هنگام دریافت اطلاعات رخ داد.");
		} finally {
			setIsPending(false);
		}
	}, [encryptedId, invoiceNo, issueNo]);

	return (
		<Button
			className="min-w-full xs:min-w-24"
			disabled={isPending}
			onClick={handleClick}
		>
			<Spinner loading={isPending} size="xs">
				<FaDownload />
			</Spinner>
			<span>دانلود {issueNo ? "فاکتور" : "پیش فاکتور"}</span>
		</Button>
	);
}

export { InvoiceDownloadButton };
