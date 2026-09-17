import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

function FileDeleteDialog({
	open,
	onClose: handleClose,
	onConfirm: handleConfirm,
}: {
	open: boolean;
	onConfirm: () => Promise<void>;
	onClose: () => void;
}) {
	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>تایید حذف فایل</DialogTitle>
				</DialogHeader>
				<DialogDescription>آیا از حذف این فایل مطمئن هستید؟</DialogDescription>
				<DialogFooter>
					<Button type="button" variant="ghost" onClick={handleClose}>
						بازگشت
					</Button>
					<Button
						type="button"
						variant="destructive"
						onClick={async () => {
							await handleConfirm();
							handleClose();
						}}
					>
						حذف فایل
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export { FileDeleteDialog };
