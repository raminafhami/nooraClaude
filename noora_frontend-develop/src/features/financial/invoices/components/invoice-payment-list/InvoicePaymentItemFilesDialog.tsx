"use client";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { DialogProps } from "@/components/ui/dialog/use-dialogs";
import { FilesWidget } from "@/felo/files/components/files-widget/FilesWidget";

function InvoicePaymentItemFilesDialog({
	payload: instanceId,
	open,
	onClose,
}: DialogProps<string>) {
	return (
		<Dialog open={open} onOpenChange={onClose.bind(null, undefined)}>
			<DialogContent className="max-w-[56rem]">
				<DialogHeader>
					<DialogTitle>مدارک پرداختی فاکتور</DialogTitle>
				</DialogHeader>
				<FilesWidget instanceId={instanceId} />
			</DialogContent>
		</Dialog>
	);
}

export { InvoicePaymentItemFilesDialog };
