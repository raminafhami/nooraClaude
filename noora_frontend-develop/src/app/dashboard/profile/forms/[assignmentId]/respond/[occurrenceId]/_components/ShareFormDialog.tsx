"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

import { shareOccurrenceResponse } from "@/formBuilder/services/shareOccurrenceResponse";

import AssignUserAudit, {
	Person,
} from "../../../../../../procedure/_components/modules/AssignUserAudit";

function ShareFormDialog({
	payload,
	open,
	onClose,
}: {
	payload: { occurrenceId: string };
	open: boolean;
	onClose: (result?: boolean) => Promise<void>;
}) {
	const [selectedUser, setSelectedUser] = useState<Person[]>([]);
	const [message, setMessage] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	async function handleSubmit() {
		if (!selectedUser.length) {
			toast.warning("یک نفر را برای ارسال انتخاب کنید.");
			return;
		}
		try {
			setIsSubmitting(true);
			await shareOccurrenceResponse(
				payload.occurrenceId,
				selectedUser[0].id,
				message.trim() || undefined,
			);
			toast.success("فرم با موفقیت برای شخص انتخاب‌شده ارسال شد.");
			await onClose(true);
		} catch (err: any) {
			toast.error(err?.message || "خطا در ارسال فرم.");
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={() => !isSubmitting && onClose()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>ارسال فرم برای شخص دیگر</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col gap-4">
					<div className="flex flex-col gap-2">
						<Label>گیرنده</Label>
						<AssignUserAudit
							setIds={(users) => setSelectedUser(users.slice(-1))}
							ids={selectedUser}
						/>
					</div>

					<div className="flex flex-col gap-2">
						<Label>پیام (اختیاری)</Label>
						<Textarea
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							rows={3}
						/>
					</div>
				</div>

				<DialogFooter>
					<Button type="button" disabled={isSubmitting} onClick={handleSubmit}>
						<Spinner loading={isSubmitting} size="sm">
							ارسال
						</Spinner>
					</Button>
					<Button
						type="button"
						variant="ghost"
						disabled={isSubmitting}
						onClick={() => onClose()}
					>
						انصراف
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export { ShareFormDialog };
