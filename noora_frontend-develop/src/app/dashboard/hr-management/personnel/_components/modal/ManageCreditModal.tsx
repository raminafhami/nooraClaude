import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Personnel } from "@/hrm/personnel/models/Personnel";
import { getUsers } from "@/identity/users/services/getUsers";
import { updateUserCredit } from "@/identity/users/services/updateUserCredit";
import { Loading } from "@/ui/Loader";
import MyModal from "@/ui/Modal/contextlessModal/Modal";

interface ManageCreditModalProps {
	isShow: boolean;
	setShow: (isShow?: any) => void;
	data: Personnel;
}

export default function ManageCreditModal({
	isShow,
	setShow,
	data,
}: ManageCreditModalProps) {
	const [loading, setLoading] = useState<boolean>(true);
	const [credit, setCredit] = useState<number>(0);
	async function getUserCredit() {
		setLoading(true);
		try {
			const res = await getUsers({
				filters: { _id: data.userId },
				projection: ["credit"],
			});
			if (res) {
				setLoading(false);
				setCredit(res?.[0]?.credit);
			}
		} catch (e) {
			console.error(e);
			setLoading(false);
			toast.error("خطا در دریافت اطلاعات کاربر!");
		}
	}

	async function updateCredit() {
		setLoading(true);
		try {
			const res = await updateUserCredit(data.userId, {
				amount: credit,
				isFixed: true,
			});
			if (res) {
				setLoading(false);
				toast.success("اعتبار کاربر با موفقیت بروزرسانی شد!");
				setShow(false);
			}
		} catch (e) {
			console.error(e);
			setLoading(false);
			toast.error("خطایی رخ داد!");
		}
	}

	useEffect(() => {
		getUserCredit();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			{
				<MyModal
					size={"2xl"}
					title={`مدیریت اعتبار: ${data?.fullname}`}
					content={
						<>
							{loading ? (
								<Loading />
							) : (
								<div className={`"justify-center" mt-6 flex w-full flex-col`}>
									<Label className="mb-2">اعتبار به ریال</Label>
									<Input
										onChange={(e) => {
											const input = e.target.value;
											const numericValue = input.replace(/,/g, "");
											setCredit(+numericValue);
										}}
										value={
											credit > 0
												? credit
														?.toString()
														?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
												: ""
										}
										placeholder="مثال: 5000000"
									/>
									<div className="mt-4 flex w-full justify-end">
										<Button onClick={updateCredit}>
											{loading ? (
												<Loading
													verticalPlacement={"center"}
													horizontalPlacement={"center"}
													size={"sm"}
												/>
											) : (
												"ذخیره"
											)}
										</Button>
									</div>
								</div>
							)}
						</>
					}
					name="addProducts"
					onClose={() => setShow(false)}
					show={isShow}
				/>
			}
		</>
	);
}
