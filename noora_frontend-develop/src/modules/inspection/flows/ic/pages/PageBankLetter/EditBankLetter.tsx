import { useEffect, useState } from "react";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { Controller, useForm } from "react-hook-form";
import DatePicker from "react-multi-date-picker";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateInstanceData } from "@/felo/instances/services/updateInstanceData";
import { useInspectionContext } from "@/inspection/context/InspectionContext";
import { messages } from "@/messages";
import { Loading } from "@/ui/Loader";

import { ids } from "../../models/Ids";

interface FormData {
	[ids.bankBranch]: string;
	[ids.bankName]: string;
	[ids.registrationOrderDate]: string;
}
interface Props {
	onUpdate?: () => void;
}
export const EditBankLetter = function EditBankLetter({ onUpdate }: Props) {
	const { instance, onInstanceUpdate } = useInspectionContext();
	const {
		control,
		formState: { isValid, isDirty },
		register,
		handleSubmit,
		reset,
	} = useForm({
		defaultValues: {
			[ids.bankBranch]: instance?.parameters?.[ids.bankBranch] || "",
			[ids.bankName]: instance?.parameters?.[ids.bankName] || "",
			[ids.registrationOrderDate]:
				instance?.parameters?.[ids.registrationOrderDate] || "",
		},
	});

	const [loading, setLoading] = useState<boolean>(true);

	async function onSubmit(data: FormData) {
		setLoading(true);
		try {
			await updateInstanceData(instance.id, {
				[ids.bankBranch]: data[ids.bankBranch],
				[ids.bankName]: data[ids.bankName],
				[ids.registrationOrderDate]: data[ids.registrationOrderDate],
			});
			onInstanceUpdate(data);
			onUpdate && onUpdate();
		} catch (e: unknown) {
			toast.error("خطایی رخ داد!");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		reset({
			[ids.bankBranch]: instance?.parameters?.[ids.bankBranch] || "",
			[ids.bankName]: instance?.parameters?.[ids.bankName] || "",
			[ids.registrationOrderDate]:
				instance?.parameters?.[ids.registrationOrderDate] || "",
		});
		setLoading(false);
	}, [instance, reset]);

	return (
		<>
			<div className="mx-10 w-full">
				<Label>تغییر اطلاعات</Label>
				<form
					onSubmit={handleSubmit(onSubmit)}
					className="ml-10 mt-6 rounded-2xl bg-gray-100 p-4"
				>
					<div className="my-4">
						<Label>
							بانک
							<span className="text-red-500">*</span>
						</Label>
						<Input
							placeholder="بانک"
							className="mt-2 w-full"
							{...register("BankName", {
								required: messages.validation.required,
							})}
						/>
					</div>

					<div className="my-4">
						<Label>
							شعبه بانک
							<span className="text-red-500">*</span>
						</Label>
						<Input
							placeholder="شعبه بانک"
							className="mt-2 w-full"
							{...register("BankBranch", {
								required: messages.validation.required,
							})}
						/>
					</div>

					<div className="my-4">
						<Label>تاریخ ثبت سفارش</Label>
						<Controller
							control={control}
							name="RegistrationOrderDate"
							render={({ field: { onChange, value } }) => (
								<DatePicker
									containerClassName="w-full mt-2"
									calendar={persian}
									locale={persian_fa}
									inputClass="w-full h-10 px-2 border-gray-300 border rounded-md"
									placeholder="تاریخ ثبت سفارش"
									calendarPosition="bottom"
									onFocusedDateChange={(dateFocused) => {
										onChange(dateFocused?.format("YYYY/MM/DD") || "");
									}}
									value={value}
									hideOnScroll
								/>
							)}
							rules={{ required: messages.validation.required }}
						/>
					</div>

					<div className="my-4">
						<Label>خریدار</Label>
						<Input
							placeholder="خریدار"
							className="mt-2 w-full cursor-not-allowed text-gray-400"
							type="text"
							name="buyer"
							readOnly
							value={instance?.parameters?.[ids.buyer]?.name || ""}
						/>
					</div>

					<div className="my-4">
						<Label>گمرک</Label>
						<Input
							placeholder="گمرک"
							className="mt-2 w-full cursor-not-allowed text-gray-400"
							type="text"
							name="customName"
							readOnly
							value={instance?.parameters?.[ids.customName] || ""}
						/>
					</div>

					<div className="my-4">
						<Label>شماره تعرفه گمرکی کالاها</Label>
						<Input
							placeholder="شماره تعرفه گمرکی کالاها"
							className="mt-2 w-full cursor-not-allowed text-gray-400"
							type="text"
							name="goodsCustomTariffNos"
							readOnly
							value={instance?.parameters?.[ids.goodsCustomTariffNos]}
						/>
					</div>

					<div className="my-4">
						<Label>شرح کالاها</Label>
						<Input
							placeholder="شرح کالاها"
							className="mt-2 w-full cursor-not-allowed text-gray-400"
							type="text"
							name="goodsDescriptions"
							readOnly
							value={instance?.parameters?.[ids.goodsDescriptions]}
						/>
					</div>

					<div className="my-4">
						<Label>تاریخ پروفرما</Label>
						<DatePicker
							containerClassName="w-full mt-2"
							calendar={persian}
							locale={persian_fa}
							inputClass="w-full h-10 px-2 border-gray-300 border rounded-md cursor-not-allowed text-gray-400"
							placeholder="تاریخ پروفرما"
							calendarPosition="bottom"
							readOnly
							value={instance?.parameters?.[ids.proformaDate]}
							hideOnScroll
						/>
					</div>

					<div className="my-4">
						<Label>شماره پروفرما</Label>
						<Input
							placeholder="شماره پروفرما"
							className="mt-2 w-full cursor-not-allowed text-gray-400"
							type="text"
							name="proformaNo"
							readOnly
							value={instance?.parameters?.[ids.proformaNo]}
						/>
					</div>

					<div className="my-4">
						<Label>شماره ثبت سفارش</Label>
						<Input
							placeholder="شماره ثبت سفارش"
							className="mt-2 w-full cursor-not-allowed text-gray-400"
							type="text"
							name="registrationOrderNo"
							readOnly
							value={instance?.parameters?.[ids.registrationOrderNo]}
						/>
					</div>

					<div className="my-4 flex justify-end">
						<Button disabled={!isDirty || !isValid} className="w-[10rem]">
							{loading ? <Loading /> : "ثبت"}
						</Button>
					</div>
				</form>
			</div>
		</>
	);
};
