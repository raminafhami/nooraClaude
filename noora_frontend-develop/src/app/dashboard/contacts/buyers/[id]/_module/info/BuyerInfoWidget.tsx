"use client";

import { useCallback, useMemo, useState } from "react";
import { FaInfo, FaPencil, FaTrash } from "react-icons/fa6";
import { toast } from "sonner";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { deleteBuyer } from "@/buyers/services/deleteBuyer";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardHeader,
	CardIcon,
	CardNav,
	CardTitle,
} from "@/components/ui/card";
import { DeleteDialog } from "@/components/ui/dialog/delete-dialog";
import { useDialogs } from "@/components/ui/dialog/use-dialogs";

import { useBuyerContext } from "../useBuyerContext";
import { BuyerInfoDisplay } from "./BuyerInfoDisplay";
import { BuyerInfoForm } from "./BuyerInfoForm";

type Mode = "display" | "edit";

function BuyerInfoWidget() {
	const dialog = useDialogs();

	const { isAuthorized } = useLoggedInUser();

	const canDelete = useMemo(
		() => isAuthorized({ groups: ["buyers-manage"] }),
		[isAuthorized],
	);

	const { buyer, handleUpdate } = useBuyerContext();

	const [mode, setMode] = useState<Mode>("display");

	const handleModeDisplay = useCallback(() => {
		setMode("display");
	}, []);

	const handleModeEdit = useCallback(() => {
		setMode("edit");
	}, []);

	const handleDeleteDialogOpen = useCallback(async () => {
		const result = await dialog.open(DeleteDialog, {
			title: `خریدار «${buyer.name}»`,
			onSubmit: async () => {
				await deleteBuyer(buyer.id);
			},
			onError: () => {
				toast.error("خطای نامشخصی در هنگام حذف خریدار رخ داد.");
			},
		});

		if (result) {
			toast.success("خریدار مورد نظر با موفقیت حذف شد.");
			handleUpdate({ isDeleted: true });
		}
	}, [dialog, buyer.id, buyer.name, handleUpdate]);

	return (
		<div className="col-span-full !col-start-1 xl:col-span-8">
			<Card>
				<CardHeader orientation="horizontal">
					<CardTitle>
						<CardIcon>
							<FaInfo />
						</CardIcon>
						اطلاعات حساب
					</CardTitle>

					{mode === "display" && !buyer.isDeleted && (
						<CardNav>
							<Button variant="secondary" onClick={handleModeEdit}>
								<FaPencil />
								<span>ویرایش اطلاعات</span>
							</Button>

							{canDelete && (
								<Button variant="destructive" onClick={handleDeleteDialogOpen}>
									<FaTrash />
									<span>حذف خریدار</span>
								</Button>
							)}
						</CardNav>
					)}
				</CardHeader>
				{mode === "display" ? (
					<BuyerInfoDisplay />
				) : (
					<BuyerInfoForm onCancel={handleModeDisplay} />
				)}
			</Card>
		</div>
	);
}

export { BuyerInfoWidget };
