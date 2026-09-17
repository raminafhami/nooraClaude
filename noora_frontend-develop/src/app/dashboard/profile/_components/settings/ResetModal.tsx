"use client";

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
import { Spinner } from "@/components/ui/spinner";

function ResetModal({
	submit,
	loading,
	title,
	open,
	setOpen,
}: {
	submit: any;
	loading: boolean;
	title: string;
	open: boolean;
	setOpen: (s: boolean) => void;
}) {
	return (
		<Dialog open={open} onOpenChange={(open) => setOpen(open)}>
			<DialogTrigger asChild>
				<Button variant="destructive" disabled={loading}>
					حالت پیش فرض
				</Button>
			</DialogTrigger>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>آیا مطمئن هستید؟</DialogTitle>
					<DialogDescription>
						تمام تنظیمات {title} شما به حالت پیش فرض تغییر می کند.
					</DialogDescription>
				</DialogHeader>

				<DialogFooter>
					<Button disabled={loading} variant="destructive" onClick={submit}>
						<Spinner loading={loading}>تایید</Spinner>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default ResetModal;
