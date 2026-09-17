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
import { deleteCompanyDispatcherCategory } from "../../services/deleteCompanyDispatcherCategory";

function DispatcherCategoryCompanyRemoveDialog({
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

			await deleteCompanyDispatcherCategory(category.domainCode);

			toast.success("گروه کالای مورد نظر با موفقیت برای سازمان غیرفعال شد.");

			onClose(true);
		} catch {
			toast.error(
				"خطای نامشخصی در هنگام غیرفعال کردن گروه کالایی برای سازمان رخ داد.",
			);
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
					<DialogTitle>غیرفعال کردن گروه کالایی برای سازمان</DialogTitle>
					<DialogDescription>
						آیا از غیرفعال کردن گروه کالایی با کد «
						<Numeric value={category.domainCode} />» و دامنه بازرسی «
						{category.inspectionDomain}» برای سازمان مطمئن هستید؟
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
							غیرفعال کردن گروه کالایی برای سازمان
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

export default DispatcherCategoryCompanyRemoveDialog;
