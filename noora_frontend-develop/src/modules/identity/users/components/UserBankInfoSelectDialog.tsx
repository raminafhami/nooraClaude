"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { FaHouseChimneyMedical } from "react-icons/fa6";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { DialogProps, useDialogs } from "@/components/ui/dialog/use-dialogs";
import { Numeric } from "@/components/ui/numeric";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { UserBankInfo } from "@/identity/users/models/UserBankInfo";
import getUserById from "@/identity/users/services/getUserById";

const UserBankInfoUpsertDialog = dynamic(
	() => import("@/identity/users/components/UserBankInfoUpsertDialog"),
);

function UserBankInfoSelectDialog({
	payload: { userId },
	open,
	onClose,
}: DialogProps<
	{
		userId: string;
	},
	UserBankInfo | undefined
>) {
	const dialog = useDialogs();

	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [selectedBank, setSelectedBank] = useState<UserBankInfo>();
	const [bankInfos, setBankInfos] = useState<UserBankInfo[]>();

	useEffect(() => {
		const fetchUser = async () => {
			try {
				setIsLoading(true);

				const user = await getUserById(userId);

				setBankInfos(user.bankInfos ?? []);
			} catch {
				toast.error("خطای نامشخصی در هنگام دریافت حساب های کاربر رخ داد.");
			} finally {
				setIsLoading(false);
			}
		};

		fetchUser();
	}, [userId]);

	const handleSubmit = () => {
		onClose(selectedBank);
	};

	const handleBankInfoAdd = useCallback(async () => {
		const result = await dialog.open(UserBankInfoUpsertDialog, {
			userId,
		});

		if (result) {
			onClose(result);
		}
	}, [dialog, userId, onClose]);

	return (
		<Dialog open={open} onOpenChange={onClose.bind(null, undefined)}>
			<DialogContent className="max-w-screen-sm">
				<DialogHeader>
					<DialogTitle>فهرست حساب های بانکی کاربر</DialogTitle>
				</DialogHeader>

				<div className="grid gap-6">
					<Table
						loading={isLoading}
						slotProps={{
							wrapper: { className: "-mx-6" },
							root: { className: "rounded-none border-x-0" },
						}}
					>
						<TableBody>
							{bankInfos?.map((bankInfo) => (
								<TableRow
									key={bankInfo.id}
									data-state={
										bankInfo.id === selectedBank?.id ? "selected" : undefined
									}
									className="cursor-pointer whitespace-nowrap"
									onClick={() => setSelectedBank(bankInfo)}
								>
									<TableCell>
										<div>{bankInfo.title || "بدون عنوان"}</div>
									</TableCell>

									<TableCell>
										<div className="space-y-1">
											<div>بانک {bankInfo.bankName || "نامشخص"}</div>
											{bankInfo.bankBranch && (
												<div>شعبه {bankInfo.bankBranch}</div>
											)}
										</div>
									</TableCell>

									<TableCell>
										<div className="space-y-1">
											{bankInfo.bankAccountNumber && (
												<div>
													<span className="text-muted-foreground">
														شماره حساب:
													</span>
													&nbsp;
													<Numeric value={bankInfo.bankAccountNumber} />
												</div>
											)}

											<div>
												<span className="text-muted-foreground">
													شماره کارت:
												</span>
												&nbsp;
												<Numeric
													value={bankInfo.bankCardNumber}
													placeholder="-"
												/>
											</div>

											<div>
												<span className="text-muted-foreground">
													شماره شبا:
												</span>
												&nbsp;
												<Numeric value={bankInfo.bankSheba} placeholder="-" />
											</div>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>

					<DialogFooter>
						<Button
							className="order-1 min-w-24"
							disabled={!selectedBank || isLoading}
							type="submit"
							variant="primary"
							onClick={handleSubmit}
						>
							انتخاب
						</Button>

						<Button
							onClick={handleBankInfoAdd}
							className="order-2 xs:order-3 xs:me-auto"
							variant="default"
							disabled={isLoading}
						>
							<FaHouseChimneyMedical />
							<span>افزودن حساب جدید</span>
						</Button>

						<Button
							className="order-2"
							type="button"
							variant="ghost"
							onClick={onClose.bind(null, undefined)}
						>
							بازگشت
						</Button>
					</DialogFooter>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default UserBankInfoSelectDialog;
