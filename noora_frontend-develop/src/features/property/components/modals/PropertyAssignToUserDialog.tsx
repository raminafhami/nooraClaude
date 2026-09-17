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
import { DialogProps } from "@/components/ui/dialog/use-dialogs";
import { UserLookupSelect } from "@/identity/users/components/UserLookupSelect";
import { UserLookup } from "@/identity/users/models/UserLookup";
import { UserType } from "@/identity/users/models/UserType";
import { Property } from "@/property/models/Property";
import { assignPropertyToUser } from "@/property/services/assignPropertyToUser";

import { AssignmentHistoryTable } from "./AssignmentHistoryTable";

const PropertyAssignToUserDialog = ({
	payload,
	open,
	onClose,
}: DialogProps<{ property: Property }, boolean | undefined>) => {
	const [user, setUser] = useState<UserLookup>();

	const handleSubmit = async () => {
		try {
			await assignPropertyToUser(payload.property.id, user!.id);
			toast.success("کالای مورد نظر با موفقیت به کاربر اختصاص داده شد.");
			onClose(true);
		} catch (err) {
			console.error(err);
			toast.error("خطای نامشخصی در هنگام اختصاص اموال به کاربر رخ داد.");
		}
	};

	return (
		<Dialog open={open} onOpenChange={onClose.bind(null, undefined)}>
			<DialogContent className="max-w-screen-sm">
				<DialogHeader>
					<DialogTitle>تحویل کالا به کاربر</DialogTitle>
				</DialogHeader>

				<div className="space-y-8">
					<div className="flex flex-col gap-4">
						<div className="flex w-full items-center justify-start gap-x-5">
							<div>تحویل کالا به</div>
							<div className="ms-auto w-2/3">
								<UserLookupSelect
									value={user || null}
									placeholder="جستجوی کاربران"
									type={UserType.Personnel}
									onValueChange={(value) => setUser(value ?? undefined)}
								/>
							</div>
						</div>

						<DialogFooter>
							<Button
								type="button"
								variant="primary"
								className="min-w-24"
								onClick={handleSubmit}
							>
								ثبت
							</Button>

							<Button
								type="button"
								variant="ghost"
								onClick={onClose.bind(null, undefined)}
							>
								بازگشت
							</Button>
						</DialogFooter>
					</div>

					{payload.property.assignmentHistory.length > 0 && (
						<AssignmentHistoryTable
							items={payload.property.assignmentHistory}
						/>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default PropertyAssignToUserDialog;
