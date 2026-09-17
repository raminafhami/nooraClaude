"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { DialogProps } from "@/components/ui/dialog/use-dialogs";
import { Numeric } from "@/components/ui/numeric";
import { Spinner } from "@/components/ui/spinner";

import { DispatcherCategory } from "../../models/DispatcherCategory";
import { deleteDispatcherCategory } from "../../services/deleteDispatcherCategory";

function DispatcherCategoryDeleteDialog({
	payload: { category },
	open,
	onClose,
}: DialogProps<
	{
		category: DispatcherCategory;
	},
	boolean | undefined
>) {
	const [isPending, setIsPending] = useState<boolean>(false);

	async function handleClick() {
		try {
			setIsPending(true);

			await deleteDispatcherCategory(category._id);

			toast.success("گروه کالای مورد نظر با موفقیت حذف شد.");

			onClose(true);
		} catch {
			toast.error("خطای نامشخصی در هنگام حذف گروه کالایی رخ داد.");
		} finally {
			setIsPending(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={onClose.bind(null, undefined)}>
			<DialogContent
				className="max-w-screen-sm"
				onInteractOutside={(event) => {
					if (isPending) {
						event.preventDefault();
					}
				}}
			>
				<DialogHeader>
					<DialogTitle>حذف گروه کالایی</DialogTitle>
					<DialogDescription>
						آیا از حذف گروه کالایی با کد «
						<Numeric value={category.domainCode} />» و دامنه بازرسی «
						{category.inspectionDomain}» مطمئن هستید؟
					</DialogDescription>
				</DialogHeader>

				<DialogFooter>
					<Button
						className="min-w-24"
						disabled={isPending}
						type="button"
						variant="destructive"
						onClick={handleClick}
					>
						<Spinner loading={isPending} size="sm">
							حذف گروه کالایی
						</Spinner>
					</Button>

					<DialogTrigger asChild>
						<Button disabled={isPending} type="button" variant="ghost">
							بازگشت
						</Button>
					</DialogTrigger>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default DispatcherCategoryDeleteDialog;
