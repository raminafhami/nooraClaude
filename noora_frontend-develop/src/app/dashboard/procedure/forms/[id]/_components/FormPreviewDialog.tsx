"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Loading } from "@/ui/Loader";
import downloadBlob from "@/utils/downloadBlob";

import { downloadRawFormPdf } from "@/formBuilder/services/downloadFormPdf";

// Preview = the server-rendered form in the organization layout (the same
// PDF as the download), built from the open draft when there is one.
function FormPreviewDialog({
	payload,
	open,
	onClose,
}: {
	payload: { formId: string; title: string; code: string };
	open: boolean;
	onClose: () => Promise<void>;
}) {
	const [blob, setBlob] = useState<Blob | null>(null);
	const [url, setUrl] = useState<string | null>(null);
	const [failed, setFailed] = useState(false);

	useEffect(() => {
		let objectUrl: string | null = null;
		downloadRawFormPdf(payload.formId, { draft: true })
			.then((pdf) => {
				objectUrl = URL.createObjectURL(pdf);
				setBlob(pdf);
				setUrl(objectUrl);
			})
			.catch(() => setFailed(true));

		return () => {
			if (objectUrl) URL.revokeObjectURL(objectUrl);
		};
	}, [payload.formId]);

	return (
		<Dialog open={open} onOpenChange={() => onClose()}>
			<DialogContent className="max-w-screen-lg">
				<DialogHeader>
					<DialogTitle>پیش‌نمایش فرم: {payload.title}</DialogTitle>
					<DialogDescription>
						نمای فرم در قالب سازمانی (همان فایل دانلودی).
					</DialogDescription>
				</DialogHeader>

				<div className="h-[75vh] overflow-hidden rounded-xl border bg-gray-50">
					{url ? (
						<iframe title="پیش‌نمایش فرم" src={url} className="size-full" />
					) : failed ? (
						<p className="p-6 text-center text-sm text-destructive">
							خطا در ساخت پیش‌نمایش فرم.
						</p>
					) : (
						<div className="flex h-full items-center justify-center">
							<Loading size="sm">در حال ساخت پیش‌نمایش...</Loading>
						</div>
					)}
				</div>

				{blob && (
					<div className="flex justify-end">
						<Button
							type="button"
							variant="outline"
							onClick={() =>
								downloadBlob({ blob, filename: `${payload.code}.pdf` })
							}
						>
							دانلود همین فایل
						</Button>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}

export { FormPreviewDialog };
