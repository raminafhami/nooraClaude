import { useEffect, useState } from "react";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { Controller, useForm } from "react-hook-form";
import DatePicker from "react-multi-date-picker";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input, inputClasses } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { banks } from "@/data/banks";
import { Instance } from "@/felo/instances/models/Instance";
import { updateInstanceData } from "@/felo/instances/services/updateInstanceData";
import { dateInputDigitsEn } from "@/form/DateInput";
import { useInspectionContext } from "@/inspection/context/InspectionContext";
import { messages } from "@/messages";
import { Head } from "@/ui/Head";
import { Loading } from "@/ui/Loader";
import Select from "@/ui/Select/Select";
import { Seperator } from "@/ui/Seperator";

import { ids } from "../../models/Ids";

interface FormData {
	[ids.bankBranch]: string;
	[ids.bankName]: string;
	[ids.goodsCustomTariffNos]: string;
	[ids.registrationOrderDate]: string;
}

function getDefaultValues(instance: Instance) {
	return {
		[ids.bankBranch]: instance.parameters[ids.bankBranch] ?? "",
		[ids.bankName]: instance.parameters[ids.bankName] ?? "",
		[ids.goodsCustomTariffNos]:
			instance.parameters[ids.goodsCustomTariffNos] ?? "",
		[ids.registrationOrderDate]:
			instance.parameters[ids.registrationOrderDate] ?? "",
	};
}

export const BankLetterEditForm = function BankLetterEditForm() {
	const { instance, onInstanceUpdate } = useInspectionContext();
	const { control, formState, handleSubmit, register, reset } = useForm({
		defaultValues: getDefaultValues(instance),
	});

	const { isDirty } = formState;

	const [loading, setLoading] = useState<boolean>(false);

	async function onSubmit(data: FormData) {
		setLoading(true);

		try {
			await updateInstanceData(instance.id, data);

			onInstanceUpdate(data);
		} catch (e: unknown) {
			toast.error("خطایی رخ داد!");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		reset(getDefaultValues(instance));
	}, [instance, reset]);

	return (
		<>
			<div className="w-full space-y-6 md:max-w-96">
				<Head.Root>
					<Head.Title text="اطلاعات نامه" />
				</Head.Root>

				<form
					onSubmit={handleSubmit(onSubmit)}
					className="space-y-10 rounded-2xl bg-gray-100 p-6"
				>
					<div className="space-y-6">
						<div className="space-y-2">
							<Label htmlFor={ids.bankName}>بانک:</Label>
							<Controller
								control={control}
								name={ids.bankName}
								render={({ field }) => <Select items={banks} {...field} />}
								rules={{ required: messages.validation.required }}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor={ids.bankBranch}>شعبه بانک:</Label>
							<Input
								className="w-full"
								id={ids.bankBranch}
								{...register(ids.bankBranch, {
									required: messages.validation.required,
								})}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor={ids.registrationOrderDate}>
								تاریخ ثبت سفارش:
							</Label>
							<Controller
								control={control}
								name={ids.registrationOrderDate}
								render={({ field: { onChange, name, value } }) => (
									<DatePicker
										calendar={persian}
										calendarPosition="bottom"
										containerClassName="w-full"
										digits={dateInputDigitsEn}
										hideOnScroll
										id={name}
										inputClass={inputClasses}
										locale={persian_fa}
										value={value}
										onFocusedDateChange={(focusedDate) => {
											onChange({
												target: {
													value: focusedDate?.format("YYYY/MM/DD") ?? "",
												},
											});
										}}
									/>
								)}
								rules={{ required: messages.validation.required }}
							/>
						</div>

						<div className="space-y-2">
							<Label>شماره تعرفه گمرکی کالاها:</Label>
							<Input
								className="w-full"
								id={ids.goodsCustomTariffNos}
								{...register(ids.goodsCustomTariffNos, {
									required: messages.validation.required,
								})}
							/>
						</div>

						<Seperator className="!mt-8 bg-gray-200" />

						<div className="space-y-2">
							<Label>خریدار:</Label>
							<Input
								className="w-full cursor-not-allowed text-gray-500"
								readOnly
								value={instance.parameters[ids.buyer]?.name || ""}
							/>
						</div>

						<div className="space-y-2">
							<Label>گمرک:</Label>
							<Input
								className="w-full cursor-not-allowed text-gray-500"
								readOnly
								value={instance.parameters[ids.customName] || ""}
							/>
						</div>

						<div className="space-y-2">
							<Label>شرح کالاها:</Label>
							<Input
								className="w-full cursor-not-allowed text-gray-500"
								readOnly
								value={instance.parameters[ids.goodsDescriptions]}
							/>
						</div>

						<div className="space-y-2">
							<Label>تاریخ پروفرما:</Label>
							<Input
								className="w-full cursor-not-allowed text-gray-500"
								readOnly
								value={instance.parameters[ids.proformaDate]}
							/>
						</div>

						<div className="space-y-2">
							<Label>شماره پروفرما:</Label>
							<Input
								className="w-full cursor-not-allowed text-gray-500"
								readOnly
								value={instance.parameters[ids.proformaNo]}
							/>
						</div>

						<div className="space-y-2">
							<Label>شماره ثبت سفارش:</Label>
							<Input
								className="w-full cursor-not-allowed text-gray-500"
								readOnly
								value={instance.parameters[ids.registrationOrderNo]}
							/>
						</div>
					</div>

					<div>
						<Button className="w-full" disabled={!isDirty}>
							{loading ? <Loading /> : "ثبت"}
						</Button>
					</div>
				</form>
			</div>
		</>
	);
};
