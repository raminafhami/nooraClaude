"use client";

import { useEffect, useState } from "react";

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
import { Loading } from "@/ui/Loader";

import { getMySignature } from "@/formBuilder/services/getMySignature";

// Final-submission confirmation: shows the employee the exact signature that
// will be attached from their personnel documents before they confirm.
function FinalizeConfirmDialog({
	open,
	onClose,
}: DialogProps<undefined, boolean | undefined>) {
	const [signature, setSignature] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [failed, setFailed] = useState(false);

	useEffect(() => {
		getMySignature()
			.then(setSignature)
			.catch(() => setFailed(true))
			.finally(() => setLoading(false));
	}, []);

	return (
		<Dialog open={open} onOpenChange={() => onClose(undefined)}>
			<DialogContent className="max-w-screen-sm">
				<DialogHeader>
					<DialogTitle>ثبت نهایی و امضا</DialogTitle>
					<DialogDescription>
						با ثبت نهایی، پاسخ‌ها همراه با امضای زیر ثبت می‌شوند و دیگر قابل
						ویرایش نخواهند بود.
					</DialogDescription>
				</DialogHeader>

				<div className="flex min-h-[10rem] items-center justify-center rounded-xl border border-dashed bg-gray-50 p-4">
					{loading ? (
						<Loading size="sm">در حال دریافت امضا...</Loading>
					) : signature ? (
						<img
							src={`data:image/png;base64,${signature}`}
							alt="امضای شما"
							className="h-36 w-full object-contain"
						/>
					) : (
						<p className="text-center text-sm text-destructive">
							{failed
								? "خطا در دریافت امضا."
								: "امضای تأییدشده‌ای در مدارک پرسنلی شما ثبت نشده است. لطفاً ابتدا امضای خود را در بخش مدارک ثبت کنید."}
						</p>
					)}
				</div>

				<DialogFooter>
					<Button
						type="button"
						disabled={loading || !signature}
						onClick={() => onClose(true)}
					>
						تأیید و ثبت نهایی
					</Button>
					<Button type="button" variant="ghost" onClick={() => onClose(undefined)}>
						انصراف
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export { FinalizeConfirmDialog };
