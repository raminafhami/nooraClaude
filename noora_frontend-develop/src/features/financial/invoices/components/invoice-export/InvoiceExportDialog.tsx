"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FaDownload, FaPrint } from "react-icons/fa6";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Conditional } from "@/components/ui/conditional";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import downloadBlob from "@/utils/downloadBlob";

import { Invoice } from "../../models/Invoice";
import { generateInvoiceTemplate } from "../../services/generateInvoiceTemplate";
import { getInvoiceNoSequence } from "../../utils/getInvoiceNoSequence";

function InvoiceExportDialog({
	payload,
	open,
	onClose,
}: {
	payload: Pick<Invoice, "id" | "invoiceNo" | "issueNo">;
	open: boolean;
	onClose: () => void;
}) {
	const handleClose = useCallback(() => {
		onClose();
	}, [onClose]);

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<Conditional mount={open} delay>
				<InvoiceExport {...payload} />
			</Conditional>
		</Dialog>
	);
}

function InvoiceExport({
	id,
	invoiceNo,
	issueNo,
}: Pick<Invoice, "id" | "invoiceNo" | "issueNo">) {
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [content, setContent] = useState<string>();

	const iframeRef = useRef<HTMLIFrameElement>(null);

	const handlePrintClick = useCallback(() => {
		iframeRef.current?.contentWindow?.print();
	}, []);

	const [isPending, setIsPending] = useState<boolean>(false);

	const handleDownloadClick = useCallback(async () => {
		try {
			if (isPending) {
				return;
			}

			setIsPending(true);

			const blob = await generateInvoiceTemplate(id, {
				download: "pdf",
			});

			const filename = `${getInvoiceNoSequence(invoiceNo)} ${issueNo ? "Invoice" : "Preinvoice"}`;

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
	}, [id, invoiceNo, issueNo, isPending]);

	useEffect(() => {
		(async () => {
			try {
				setIsLoading(true);

				const content = await generateInvoiceTemplate(id, {
					download: "html",
				});
				setContent(JSON.parse(content)?.html);
			} catch (err) {
				console.error(err);
				toast.error("خطای نامشخصی در هنگام دریافت اطلاعات رخ داد.");
			} finally {
				setIsLoading(false);
			}
		})();
	}, [id]);

	return (
		<DialogContent
			className="max-w-screen-lg"
			onInteractOutside={(event) => {
				if (isPending) {
					event.preventDefault();
				}
			}}
		>
			<DialogHeader>
				<DialogTitle>خروجی فاکتور</DialogTitle>
			</DialogHeader>
			<div className="space-y-6">
				<Card className="flex min-h-[32rem] w-full items-center justify-center bg-gray-100 px-2">
					<Spinner loading={isLoading}>
						<iframe
							ref={iframeRef}
							className="min-h-[inherit] w-a4-portrait max-w-full overflow-auto"
							srcDoc={content}
						/>
					</Spinner>
				</Card>

				<div className="flex flex-col gap-3 xs:flex-row">
					<Button className="xs:min-w-24" onClick={handlePrintClick}>
						<FaPrint />
						پرینت
					</Button>

					<Button
						className="xs:min-w-24"
						disabled={isPending}
						onClick={handleDownloadClick}
					>
						<Spinner loading={isPending} size="sm">
							<FaDownload />
							دانلود
						</Spinner>
					</Button>
				</div>
			</div>
		</DialogContent>
	);
}

export { InvoiceExportDialog };
