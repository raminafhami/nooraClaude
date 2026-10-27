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
import { PersonnelExpertise } from "@/hrm/personnel/models/PersonnelExpertise";
import { PersonnelExpertise as UpdatedPersonnelExpertise } from "@/hrm/personnelExpertise/models/PersonnelExpertise";
import { PersonnelExpertiseStatus } from "@/hrm/personnelExpertise/models/PersonnelExpertiseStatus";
import { deleteExpertiseCertificate } from "@/hrm/personnelExpertise/services/deleteExpertiseCertificate";

function CertificateDeleteDialog({
	payload,
	open,
	onClose,
}: {
	payload: PersonnelExpertise;
	open: boolean;
	onClose: (result?: UpdatedPersonnelExpertise) => void;
}) {
	return (
		<Dialog open={open} onOpenChange={() => onClose()}>
			<Conditional mount={open} delay>
				<CertificateDeleteForm expertise={payload} onClose={onClose} />
			</Conditional>
		</Dialog>
	);
}

function CertificateDeleteForm({
	expertise,
	onClose,
}: {
	expertise: PersonnelExpertise;
	onClose: (result?: UpdatedPersonnelExpertise) => void;
}) {
	const [isPending, setIsPending] = useState<boolean>(false);

	async function handleDelete() {
		try {
			setIsPending(true);

			// The certificate (record and file) goes; the item stays on the
			// checklist as "ندارد" since the person's job still requires it.
			await deleteExpertiseCertificate(expertise.id);
			toast.success("گواهینامه مورد نظر با موفقیت حذف شد.");
			onClose({
				id: expertise.id,
				expertiseId: expertise.expertiseId,
				status: PersonnelExpertiseStatus.Unqualified,
				certificate: null,
			} as UpdatedPersonnelExpertise);
		} catch (err) {
			console.error(err);
			toast.error("خطای نامشخصی در هنگام حذف گواهینامه رخ داد.");
		} finally {
			setIsPending(false);
		}
	}

	return (
		<DialogContent>
			<DialogHeader>
				<DialogTitle>تایید حذف گواهینامه</DialogTitle>
				<DialogDescription>
					آیا از حذف گواهینامه «{expertise.title}» مطمئن هستید؟
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
						حذف گواهینامه
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

export { CertificateDeleteDialog };
