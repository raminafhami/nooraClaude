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
import { DialogProps } from "@/components/ui/dialog/use-dialogs";
import { Spinner } from "@/components/ui/spinner";
import { isLockedInvoiceErrorMessage } from "@/financial/invoices/utils/isLockedInvoiceErrorMessage";

import { deleteIncome } from "../../services/deleteIncome";
import { isLockedIncomeErrorMessage } from "../../utils/isLockedIncomeErrorMessage";

function IncomeDeleteDialog({
	open,
	payload: incomeId,
	onClose,
}: DialogProps<string, boolean>) {
	const [isPending, setIsPending] = useState<boolean>(false);

	return (
		<Dialog open={open} onOpenChange={() => onClose()}>
			<DialogContent
				onInteractOutside={(event) => {
					if (isPending) event.preventDefault();
				}}
			>
				<DialogHeader>
					<DialogTitle>تایید حذف درآمد</DialogTitle>
					<DialogDescription>
						آیا از حذف این درآمد مطمئن هستید؟
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button
						disabled={isPending}
						type="button"
						variant="ghost"
						onClick={() => onClose()}
					>
						بازگشت
					</Button>
					<Button
						disabled={isPending}
						type="button"
						variant="destructive"
						onClick={async () => {
							try {
								setIsPending(true);
								await deleteIncome(incomeId);
								toast.error("درآمد مورد نظر با موفقیت حذف شد.");
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
										"خطای نامشخصی در هنگام حذف درآمد مورد نظر رخ داد.",
								);
							} finally {
								setIsPending(false);
							}
						}}
					>
						<Spinner color="white" loading={isPending} size="sm">
							<span>حذف</span>
						</Spinner>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export { IncomeDeleteDialog };
