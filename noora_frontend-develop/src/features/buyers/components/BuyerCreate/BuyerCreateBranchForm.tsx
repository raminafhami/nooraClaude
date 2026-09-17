"use client";

import { useForm } from "react-hook-form";
import { FaCircleInfo } from "react-icons/fa6";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { buyerReferralSource } from "@/buyers/enums/BuyerReferralSource";
import { BuyerType } from "@/buyers/enums/BuyerType";
import { Buyer } from "@/buyers/models/Buyer";
import { addBuyerToBranch } from "@/buyers/services/addBuyerToBranch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loading } from "@/ui/Loader";

interface Props {
	buyer: Buyer;
	onCreate?: (buyer: Buyer) => void;
	onClose: () => void;
}

function BuyerCreateBranchForm({ buyer, onCreate, onClose }: Props) {
	const { identity } = useLoggedInUser();

	const form = useForm();
	const {
		formState: { errors, isSubmitting, isSubmitSuccessful },
		handleSubmit: handleRhfSubmit,
		setError,
	} = form;

	async function handleSubmit() {
		try {
			if (!identity.branchId) {
				throw new Error("شناسه شعبه شما یافت نشد.");
			}

			const updatedBuyer = await addBuyerToBranch(buyer.id, {
				branchId: identity.branchId,
			});

			onClose();
			onCreate?.(updatedBuyer);
		} catch (err) {
			console.error(err);
			setError("root.server", {
				message: "خطای نامشخصی در هنگام ثبت اطلاعات رخ داد.",
			});
		}
	}

	return (
		<Form {...form}>
			<form
				onSubmit={async (e) => {
					e.stopPropagation();
					await handleRhfSubmit(handleSubmit)(e);
				}}
			>
				<fieldset
					className="space-y-8"
					disabled={isSubmitting || isSubmitSuccessful}
				>
					<Alert variant="info">
						<FaCircleInfo />
						<AlertDescription>
							اطلاعات خریدار مورد نظر در سامانه یافت شد.
							<br />
							در صورت تایید اطلاعات، در انتهای فرم، دکمه افزودن را انتخاب کنید.
						</AlertDescription>
					</Alert>

					<div className="grid grid-cols-12 gap-6">
						<div className="col-span-full !col-start-1 space-y-2 sm:col-span-6">
							<label>نام (به فارسی):</label>
							<Input disabled value={buyer.name || "-"} />
						</div>

						<div className="col-span-full !col-start-1 space-y-2 sm:col-span-6">
							<label>نام (به انگلیسی):</label>
							<Input
								className="text-right"
								dir="ltr"
								disabled
								value={buyer.nameEn || "-"}
							/>
						</div>

						{buyer.type === BuyerType.Legal && (
							<div className="col-span-full !col-start-1 space-y-2 sm:col-span-6">
								<label>شماره ثبت:</label>
								<Input
									className="text-right"
									dir="ltr"
									disabled
									value={buyer.registrationNo || "-"}
								/>
							</div>
						)}

						<div className="col-span-full !col-start-1 space-y-2 sm:col-span-6">
							<label>شماره تماس:</label>
							<Input
								className="text-right"
								dir="ltr"
								disabled
								value={buyer.phoneNo || "-"}
							/>
						</div>

						<div className="col-span-full !col-start-1 space-y-2 sm:col-span-6">
							<label>شماره فکس:</label>
							<Input
								className="text-right"
								dir="ltr"
								disabled
								value={buyer.faxNo || "-"}
							/>
						</div>

						<div className="col-span-full !col-start-1 space-y-2 sm:col-span-9">
							<label>پست الکترونیک:</label>
							<Input
								className="text-right"
								dir="ltr"
								disabled
								value={buyer.email || "-"}
							/>
						</div>

						<div className="col-span-full !col-start-1 space-y-2 sm:col-span-6">
							<label>کدپستی:</label>
							<Input
								className="text-right"
								dir="ltr"
								disabled
								value={buyer.postalCode || "-"}
							/>
						</div>

						<div className="col-span-full col-start-1 space-y-2">
							<label>آدرس:</label>
							<Input disabled value={buyer.address || "-"} />
						</div>

						<div className="col-span-full !col-start-1 space-y-2 sm:col-span-6">
							<label>کدپستی:</label>
							<Input disabled value={buyer.postalCode || "-"} />
						</div>

						<div className="col-span-full !col-start-1 space-y-2 sm:col-span-6">
							<label>صنعت:</label>
							<Input disabled value={buyer.industry?.name || "-"} />
						</div>

						<div className="col-span-full !col-start-1 space-y-2 sm:col-span-6">
							<label>زیرصنعت:</label>
							<Input disabled value={buyer.subIndustry?.name || "-"} />
						</div>

						<div className="col-span-full !col-start-1 space-y-2 sm:col-span-6">
							<label>نحوه آشنایی:</label>
							<Input
								disabled
								value={
									buyer.referralSource
										? buyerReferralSource[buyer.referralSource].title
										: "-"
								}
							/>
						</div>
					</div>

					{errors.root?.server && (
						<DestructiveAlert>
							<AlertDescription>{errors.root.server.message}</AlertDescription>
						</DestructiveAlert>
					)}

					<div className="flex gap-3">
						<Button className="min-w-full xs:min-w-32" variant="primary">
							افزودن
							{isSubmitting && <Loading size="xs" />}
						</Button>

						<Button
							className="w-full xs:w-auto"
							type="button"
							variant="ghost"
							onClick={onClose}
						>
							انصراف
						</Button>
					</div>
				</fieldset>
			</form>
		</Form>
	);
}

export { BuyerCreateBranchForm };
