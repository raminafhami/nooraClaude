"use client";

import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

import { banks, customs } from "@/data";
import { DateInput } from "@/form/DateInput";
import { Input } from "@/form/Input";
import { MobileNoInput } from "@/form/MobileNoInput";
import { Select } from "@/form/select";
import { Textarea } from "@/form/textarea";
import { caseTypes } from "@/inspection/models/CaseType";
import { messages } from "@/messages";
import { Seperator } from "@/ui/Seperator";

import { ids } from "../../models/Ids";
import { schema } from "./PhaseSchema";

type FormData = z.infer<typeof schema>;

export function PhasePage() {
	const {
		formState: { errors },
		register,
		setValue,
		trigger,
		watch,
	} = useFormContext<FormData>();
	const fields = watch();

	useEffect(() => {
		register(ids.caseType);
		register(ids.registrationOrderDate);
		register(ids.proformaDate);
		register(ids.bankName);
		register(ids.customName);
	}, [register]);

	return (
		<div className="grid grid-cols-12 gap-x-10 gap-y-6">
			{/* buyer */}
			{/* <div className="col-span-3">
        <label htmlFor={ids.buyerName}>خریدار:</label>
        <Input
          className="mt-2"
          id={ids.buyerName}
          {...register(ids.buyerName, {
            required: messages.validation.required,
          })}
        />
        <FieldError error={errors[ids.buyerName]} />
      </div> */}

			<Seperator className="mt-5" />

			{/* invoice */}
			<div className="col-span-3 col-start-1">
				<label htmlFor={ids.caseType}>نوع فاکتور:</label>
				<div className="mt-2">
					<Select
						id={ids.caseType}
						items={caseTypes}
						optional
						value={fields[ids.caseType]}
						onLeave={() => trigger(ids.caseType)}
						onMutate={(v) =>
							setValue(ids.caseType, v, {
								shouldDirty: true,
								shouldTouch: true,
								shouldValidate: true,
							})
						}
					/>
				</div>
			</div>

			<Seperator className="mt-5" />

			{/* registration */}
			<div className="col-span-3 col-start-1">
				<label htmlFor={ids.registrationOrderNo}>شماره ثبت سفارش:</label>
				<Input
					className="mt-2"
					id={ids.registrationOrderNo}
					{...register(ids.registrationOrderNo)}
				/>
			</div>

			<div className="col-span-3">
				<label htmlFor={ids.registrationOrderDate}>تاریخ ثبت سفارش:</label>
				<div className="mt-2">
					<DateInput
						id={ids.registrationOrderDate}
						value={fields[ids.registrationOrderDate]}
						onLeave={() => {
							trigger(ids.registrationOrderDate);
						}}
						onMutate={(v) => {
							setValue(ids.registrationOrderDate, v, {
								shouldDirty: true,
								shouldTouch: true,
								shouldValidate: true,
							});
						}}
					/>
				</div>
			</div>

			<Seperator className="mt-5" />

			{/* proforma */}
			<div className="col-span-3 col-start-1">
				<label htmlFor={ids.proformaNo}>شماره پروفرما:</label>
				<Input
					className="mt-2"
					id={ids.proformaNo}
					{...register(ids.proformaNo)}
				/>
			</div>

			<div className="col-span-3">
				<label htmlFor={ids.proformaDate}>تاریخ پروفرما:</label>
				<div className="mt-2">
					<DateInput
						calendarType="gregorian"
						id={ids.proformaDate}
						lang="en"
						value={fields[ids.proformaDate]}
						onLeave={() => trigger(ids.proformaDate)}
						onMutate={(v) =>
							setValue(ids.proformaDate, v, {
								shouldDirty: true,
								shouldTouch: true,
								shouldValidate: true,
							})
						}
					/>
				</div>
			</div>

			<Seperator className="mt-5" />

			{/* bank */}
			<div className="col-span-3 col-start-1">
				<label htmlFor={ids.bankName}>نام بانک:</label>
				<div className="mt-2">
					<Select
						id={ids.bankName}
						items={banks}
						optional
						value={fields[ids.bankName]}
						onLeave={() => trigger(ids.bankName)}
						onMutate={(v) =>
							setValue(ids.bankName, v, {
								shouldDirty: true,
								shouldTouch: true,
								shouldValidate: true,
							})
						}
					/>
				</div>
			</div>

			<div className="col-span-3">
				<label htmlFor={ids.bankBranch}>شعبه بانک:</label>
				<Input
					className="mt-2"
					id={ids.bankBranch}
					{...register(ids.bankBranch)}
				/>
			</div>

			<Seperator className="mt-5" />

			{/* custom */}
			<div className="col-span-3 col-start-1">
				<label htmlFor={ids.customName}>گمرک:</label>
				<div className="mt-2">
					<Select
						id={ids.customName}
						items={customs}
						optional
						value={fields[ids.customName]}
						onBlur={() => trigger(ids.customName)}
						onMutate={(v) =>
							setValue(ids.customName, v, {
								shouldDirty: true,
								shouldTouch: true,
								shouldValidate: true,
							})
						}
					/>
				</div>
			</div>

			{/* <div className="col-span-3">
        <label htmlFor={ids.customTariffNo}>شماره تعرفه گمرک:</label>
        <Input
          className="mt-2"
          id={ids.customTariffNo}
          {...register(ids.customTariffNo)}
        />
      </div> */}

			<Seperator className="mt-5" />

			{/* discharger */}
			<div className="col-span-3">
				<label htmlFor={ids.dischargerName}>نام ترخیص کار:</label>
				<Input
					className="mt-2"
					id={ids.dischargerName}
					{...register(ids.dischargerName)}
				/>
			</div>

			<div className="col-span-3">
				<label htmlFor={ids.dischargerPhoneNo}>شماره تماس ترخیص کار:</label>
				<MobileNoInput
					className="mt-2"
					id={ids.dischargerPhoneNo}
					value={fields[ids.dischargerPhoneNo]}
					onMutate={(v) => {
						setValue(ids.dischargerPhoneNo, v, {
							shouldDirty: true,
							shouldTouch: true,
							shouldValidate: true,
						});
					}}
					{...(({ ref, ...register }) => register)(
						register(ids.dischargerPhoneNo),
					)}
				/>
			</div>

			<Seperator className="mt-5" />

			{/* goods */}
			{/* <div className="col-span-8 col-start-1">
        <label htmlFor={ids.descriptionOfGoods}>شرح کالا:</label>
        <Input
          className="mt-2"
          id={ids.descriptionOfGoods}
          {...register(ids.descriptionOfGoods)}
        />
      </div> */}

			<Seperator className="mt-5" />

			{/* next */}
			<div className="col-span-full">
				<label htmlFor={ids.informationFormByCustomerNote}>توضیحات:</label>
				<Textarea
					className="mt-2"
					id={ids.informationFormByCustomerNote}
					{...register(ids.informationFormByCustomerNote)}
				/>
			</div>
		</div>
	);
}
