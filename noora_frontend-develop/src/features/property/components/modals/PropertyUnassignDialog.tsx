"use client";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { DialogProps } from "@/components/ui/dialog/use-dialogs";
import { unassignProperty } from "@/property/services/unassignProperty";

const PropertyUnassignDialog = ({
	payload,
	open,
	onClose,
}: DialogProps<{ id: string }, boolean | undefined>) => {
	const onSubmit = async () => {
		try {
			await unassignProperty(payload.id);
			toast.success("کالا با موفقیت حذف اختصاص شد");
			onClose(true);
		} catch (err) {
			toast.error("خطا در حذف اختصاص کالا از کاربر");
			console.error("خطا در حذف اختصاص", err);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onClose.bind(null, undefined)}>
			<DialogContent className="max-w-screen-[500px]">
				<DialogHeader>
					<DialogTitle>حذف اختصاص کالا</DialogTitle>
				</DialogHeader>
				<div className="flex flex-col gap-4">
					آیا از حذف اختصاص این کالا اطمینان دارید؟
					<div className="flex justify-end gap-x-4">
						<DialogFooter>
							<Button onClick={onSubmit} variant="destructive">
								حذف
							</Button>
							<Button
								onClick={() => {
									onClose();
								}}
								variant="ghost"
							>
								انصراف
							</Button>
						</DialogFooter>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
export default PropertyUnassignDialog;
