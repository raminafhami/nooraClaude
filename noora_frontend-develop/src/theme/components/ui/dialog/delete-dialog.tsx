"use client";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Conditional } from "@/components/ui/conditional";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { DialogProps } from "@/components/ui/dialog/use-dialogs";
import { Spinner } from "@/components/ui/spinner";

const DeleteDialog = ({
	payload,
	open,
	onClose,
}: DialogProps<
	{
		title?: string | undefined;
		onSubmit: () => Promise<void>;
		onError?: (err: any) => void;
	},
	boolean | undefined
>) => {
	const [isPending, setIsPending] = useState<boolean>(false);

	async function handleClick() {
		try {
			setIsPending(true);
			await payload.onSubmit();

			onClose(true);
		} catch (err) {
			payload.onError?.(err);
		} finally {
			setIsPending(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={() => onClose()}>
			<Conditional mount={open} delay>
				<DialogContent className="max-w-screen-sm">
					<DialogHeader>
						<DialogTitle>
							آیا از حذف
							{"  "}
							{payload?.title ?? "این آیتم"}
							{"  "}
							مطمئن هستید؟
						</DialogTitle>
					</DialogHeader>
					<div className="flex justify-end gap-2">
						<Button
							disabled={isPending}
							variant="ghost"
							onClick={onClose.bind(null, undefined)}
						>
							بازگشت
						</Button>
						<Button
							disabled={isPending}
							variant="destructive"
							onClick={handleClick}
						>
							<Spinner loading={isPending} size="sm">
								حذف
							</Spinner>
						</Button>
					</div>
				</DialogContent>
			</Conditional>
		</Dialog>
	);
};

export { DeleteDialog };
