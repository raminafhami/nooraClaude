"use client";

import { useState } from "react";
import { toast } from "sonner";

import { isApiResponse } from "@/api/utils/isApiResponse";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { isLockedIncomeErrorMessage } from "@/financial/incomes/utils/isLockedIncomeErrorMessage";

import { cancelInvoice } from "../../services/cancelInvoice";
import { isLockedInvoiceErrorMessage } from "../../utils/isLockedInvoiceErrorMessage";

function InvoiceCancelDialog({
	open,
	payload,
	onClose,
}: {
	open: boolean;
	payload: string;
	onClose: (result?: boolean) => void;
}) {
	const [isLoading, setIsLoading] = useState<boolean>(false);

	return (
		<Dialog open={open} onOpenChange={() => onClose()}>
			<DialogContent
				onInteractOutside={(event) => {
					if (isLoading) event.preventDefault();
				}}
			>
				<DialogHeader>
					<DialogTitle>تایید لغو فاکتور</DialogTitle>
					<DialogDescription>
						آیا از لغو این فاکتور مطمئن هستید؟
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button
						disabled={isLoading}
						type="button"
						variant="ghost"
						onClick={() => onClose()}
					>
						بازگشت
					</Button>
					<Button
						disabled={isLoading}
						type="button"
						variant="destructive"
						onClick={async () => {
							try {
								setIsLoading(true);
								await cancelInvoice(payload);
								toast.success("فاکتور مورد نظر با موفقیت لغو شد.");
								onClose(true);
							} catch (err) {
								console.error(err);

								let errorMessage: string | undefined;
								if (isApiResponse(err)) {
									if (
										isLockedIncomeErrorMessage(err) ||
										isLockedInvoiceErrorMessage(err)
									) {
										errorMessage = "امکان انجام این عملیات وجود ندارد.";
									}
								}

								toast.error(
									errorMessage ||
										"خطای نامشخصی در هنگام لغو فاکتور مورد نظر رخ داد.",
								);
							} finally {
								setIsLoading(false);
							}
						}}
					>
						<Spinner color="white" loading={isLoading} size="sm">
							<span>لغو فاکتور </span>
						</Spinner>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export { InvoiceCancelDialog };
