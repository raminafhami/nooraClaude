"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Conditional } from "@/components/ui/conditional";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { Expertise } from "@/hrm/expertises/models/Expertise";
import { deleteExpertise } from "@/hrm/expertises/services/deleteExpertise";

function ExpertiseDeleteDialog({
	payload,
	open,
	onClose,
}: {
	payload: Expertise;
	open: boolean;
	onClose: (result?: boolean) => void;
}) {
	return (
		<Dialog open={open} onOpenChange={onClose}>
			<Conditional mount={open} delay>
				<ExpertiseDeleteForm expertise={payload} onClose={onClose} />
			</Conditional>
		</Dialog>
	);
}

function ExpertiseDeleteForm({
	expertise,
	onClose,
}: {
	expertise: Expertise;
	onClose: (result?: boolean) => void;
}) {
	const [isPending, setIsPending] = useState<boolean>(false);

	async function handleDelete() {
		try {
			setIsPending(true);

			await deleteExpertise(expertise.id);
			toast.success("توانمندی مورد نظر با موفقیت حذف شد.");
			onClose(true);
		} catch (err) {
			console.error(err);
			toast.error("خطای نامشخصی در هنگام حذف توانمندی رخ داد.");
		} finally {
			setIsPending(false);
		}
	}

	return (
		<DialogContent>
			<DialogHeader>
				<DialogTitle>تایید حذف توانمندی</DialogTitle>
				<DialogDescription>
					آیا از حذف این توانمندی مطمئن هستید؟
				</DialogDescription>
			</DialogHeader>

			<div className="flex flex-col gap-3 xs:flex-row-reverse">
				<Button
					disabled={isPending}
					type="button"
					variant="destructive"
					onClick={handleDelete}
				>
					<Spinner color="white" loading={isPending} size="sm">
						حذف توانمندی
					</Spinner>
				</Button>

				<Button
					disabled={isPending}
					type="button"
					variant="ghost"
					onClick={() => onClose()}
				>
					بازگشت
				</Button>
			</div>
		</DialogContent>
	);
}

export { ExpertiseDeleteDialog };
