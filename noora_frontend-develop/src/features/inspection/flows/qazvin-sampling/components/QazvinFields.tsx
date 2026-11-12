"use client";

import { useEffect } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";

import { Separator } from "@/components/ui/separator";
import { DateInput } from "@/form/DateInput";
import { Input } from "@/form/Input";
import { Select } from "@/form/select";
import { Textarea } from "@/form/textarea";
import { Head } from "@/ui/Head";

import {
	doneStatuses,
	markingStatuses,
	observedStatuses,
	QAZVIN_CUSTOMS,
	QazvinIds,
	shipmentTypes,
} from "../data/Ids";

interface Props {
	/** "sampling": shipment/document fields; "inspection": also products and the inspection result */
	section: "sampling" | "inspection";
}

const setOptions = {
	shouldDirty: true,
	shouldTouch: true,
	shouldValidate: true,
} as const;

/** `Textarea` is controlled (value ?? ""), so it needs a Controller, not `register` */
function TextareaField({
	className,
	label,
	name,
}: {
	className: string;
	label: string;
	name: string;
}) {
	const { control } = useFormContext<any>();

	return (
		<Controller
			control={control}
			name={name}
			render={({ field }) => (
				<div className={className}>
					<label htmlFor={field.name}>{label}</label>
					<Textarea
						className="min-h-[6rem]"
						id={field.name}
						name={field.name}
						ref={field.ref}
						value={field.value ?? ""}
						onBlur={field.onBlur}
						onChange={field.onChange}
					/>
				</div>
			)}
		/>
	);
}

/**
 * The fields of the Qazvin form «گزارش بازرسی و نمونه برداری تعیین ماهیت کالا»
 * that the customs sampling form does not have. Rendered under the customs form.
 * It registers no task hooks (the customs page registers them only while there
 * are none).
 */
function QazvinFields({ section }: Props) {
	const { control, register, setValue, getValues } = useFormContext<any>();

	const buyerId = useWatch({ control, name: "BuyerId" });
	const productsData: any[] = useWatch({ control, name: "ProductsData" }) || [];
	const photoStatus = useWatch({ control, name: QazvinIds.photoStatus });
	const nonConformityStatus = useWatch({
		control,
		name: QazvinIds.nonConformityStatus,
	});

	useEffect(() => {
		if (!getValues(QazvinIds.samplingCustoms)) {
			setValue(QazvinIds.samplingCustoms, QAZVIN_CUSTOMS);
		}
	}, [getValues, setValue]);

	// the customs form shows its fields once a buyer is chosen
	if (!buyerId) {
		return null;
	}

	return (
		<div className="mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-12 sm:gap-x-10">
			<Separator className="col-span-full h-1" />

			<div className="col-span-full">
				<Head.Root>
					<Head.Title text="اطلاعات محموله (فرم قزوین)" />
				</Head.Root>
			</div>

			<Controller
				control={control}
				name={QazvinIds.shipmentType}
				render={({ field }) => (
					<div className="col-span-full space-y-2 sm:col-span-6 lg:col-span-3 lg:col-start-1">
						<label htmlFor={field.name}>نوع محموله</label>
						<Select
							id={field.name}
							items={shipmentTypes}
							value={field.value}
							onMutate={(v) => setValue(field.name, v || "", setOptions)}
						/>
					</div>
				)}
			/>

			<div className="col-span-full space-y-2 sm:col-span-6 lg:col-span-3">
				<label htmlFor={QazvinIds.customsLetterNo}>شماره نامه گمرک</label>
				<Input
					id={QazvinIds.customsLetterNo}
					{...register(QazvinIds.customsLetterNo)}
				/>
			</div>

			<Controller
				control={control}
				name={QazvinIds.customsLetterDate}
				render={({ field }) => (
					<div className="col-span-full space-y-2 sm:col-span-6 lg:col-span-3">
						<label htmlFor={field.name}>تاریخ نامه گمرک</label>
						<DateInput
							autoComplete="off"
							id={field.name}
							value={field.value}
							onMutate={(v) => setValue(field.name, v, setOptions)}
						/>
					</div>
				)}
			/>

			<div className="col-span-full space-y-2 sm:col-span-6 lg:col-span-3">
				<label htmlFor={QazvinIds.samplingTime}>ساعت نمونه برداری</label>
				<Input
					dir="ltr"
					className="text-right"
					id={QazvinIds.samplingTime}
					type="time"
					{...register(QazvinIds.samplingTime)}
				/>
			</div>

			<div className="col-span-full space-y-2 sm:col-span-6 lg:col-span-3 lg:col-start-1">
				<label htmlFor={QazvinIds.samplingCustoms}>
					گمرک محل نمونه برداری
				</label>
				<Input
					id={QazvinIds.samplingCustoms}
					{...register(QazvinIds.samplingCustoms)}
				/>
			</div>

			<div className="col-span-full space-y-2 lg:col-span-6">
				<label htmlFor={QazvinIds.vehicleNo}>
					شماره ماشین / شماره کانتینر / محل انبار / نام یا شماره لنج
				</label>
				<Input id={QazvinIds.vehicleNo} {...register(QazvinIds.vehicleNo)} />
			</div>

			<Controller
				control={control}
				name={QazvinIds.receiptDate}
				render={({ field }) => (
					<div className="col-span-full space-y-2 sm:col-span-6 lg:col-span-3">
						<label htmlFor={field.name}>تاریخ قبض انبار</label>
						<DateInput
							autoComplete="off"
							id={field.name}
							value={field.value}
							onMutate={(v) => setValue(field.name, v, setOptions)}
						/>
					</div>
				)}
			/>

			{section === "inspection" && (
				<>
					<Separator className="col-span-full h-1" />

					<div className="col-span-full">
						<Head.Root>
							<Head.Title text="مشخصات تکمیلی کالاها" />
						</Head.Root>
					</div>

					{productsData.map((product, index) => (
						<div
							className="col-span-full grid grid-cols-1 gap-y-4 rounded-xl border border-gray-200 p-4 sm:grid-cols-12 sm:gap-x-10"
							key={index}
						>
							<div className="col-span-full font-medium">
								ردیف {index + 1}
								{product?.ProductName ? ` - ${product.ProductName}` : ""}
							</div>

							<div className="col-span-full space-y-2 lg:col-span-6">
								<label htmlFor={`ProductsData.${index}.${QazvinIds.physicalSpecs}`}>
									مشخصات ظاهری و فیزیکی کالا
								</label>
								<Input
									id={`ProductsData.${index}.${QazvinIds.physicalSpecs}`}
									{...register(`ProductsData.${index}.${QazvinIds.physicalSpecs}`)}
								/>
							</div>

							<div className="col-span-full space-y-2 sm:col-span-6 lg:col-span-3">
								<label htmlFor={`ProductsData.${index}.${QazvinIds.grossWeight}`}>
									وزن ناخالص
								</label>
								<Input
									id={`ProductsData.${index}.${QazvinIds.grossWeight}`}
									{...register(`ProductsData.${index}.${QazvinIds.grossWeight}`)}
								/>
							</div>

							<Controller
								control={control}
								name={`ProductsData.${index}.${QazvinIds.marking}`}
								render={({ field }) => (
									<div className="col-span-full space-y-2 sm:col-span-6 lg:col-span-3">
										<label htmlFor={field.name}>نشانه گذاری</label>
										<Select
											id={field.name}
											items={markingStatuses}
											value={field.value}
											onMutate={(v) => setValue(field.name, v || "", setOptions)}
										/>
									</div>
								)}
							/>

							<div className="col-span-full space-y-2 lg:col-span-6 lg:col-start-1">
								<label htmlFor={`ProductsData.${index}.${QazvinIds.packageCount}`}>
									تعداد و نوع بسته بندی
								</label>
								<Input
									id={`ProductsData.${index}.${QazvinIds.packageCount}`}
									{...register(`ProductsData.${index}.${QazvinIds.packageCount}`)}
								/>
							</div>
						</div>
					))}

					<Separator className="col-span-full h-1" />

					<div className="col-span-full">
						<Head.Root>
							<Head.Title text="نتیجه بازرسی" />
						</Head.Root>
					</div>

					<div className="col-span-full space-y-2 sm:col-span-6 lg:col-span-3 lg:col-start-1">
						<label htmlFor={QazvinIds.inspectorPersonnelNo}>
							شماره پرسنلی بازرس
						</label>
						<Input
							id={QazvinIds.inspectorPersonnelNo}
							{...register(QazvinIds.inspectorPersonnelNo)}
						/>
					</div>

					<div className="col-span-full space-y-2 sm:col-span-6 lg:col-span-3">
						<label htmlFor={QazvinIds.assistantSamplerName}>
							نام کمک نمونه بردار
						</label>
						<Input
							id={QazvinIds.assistantSamplerName}
							{...register(QazvinIds.assistantSamplerName)}
						/>
					</div>

					<Controller
						control={control}
						name={QazvinIds.photoStatus}
						render={({ field }) => (
							<div className="col-span-full space-y-2 sm:col-span-6 lg:col-span-3 lg:col-start-1">
								<label htmlFor={field.name}>عکس برداری</label>
								<Select
									id={field.name}
									items={doneStatuses}
									value={field.value}
									onMutate={(v) => setValue(field.name, v || "", setOptions)}
								/>
							</div>
						)}
					/>

					<div className="col-span-full space-y-2 sm:col-span-6 lg:col-span-3">
						<label htmlFor={QazvinIds.minPhotos}>حداقل عکس مورد نیاز</label>
						<Input id={QazvinIds.minPhotos} {...register(QazvinIds.minPhotos)} />
					</div>

					{photoStatus === "notDone" && (
						<div className="col-span-full space-y-2 lg:col-span-6">
							<label htmlFor={QazvinIds.noPhotoReason}>علت عدم عکسبرداری</label>
							<Input
								id={QazvinIds.noPhotoReason}
								{...register(QazvinIds.noPhotoReason)}
							/>
						</div>
					)}

					<Controller
						control={control}
						name={QazvinIds.nonConformityStatus}
						render={({ field }) => (
							<div className="col-span-full space-y-2 lg:col-span-6 lg:col-start-1">
								<label htmlFor={field.name}>
									عدم انطباق محموله با اسناد گمرکی
								</label>
								<Select
									id={field.name}
									items={observedStatuses}
									value={field.value}
									onMutate={(v) => setValue(field.name, v || "", setOptions)}
								/>
							</div>
						)}
					/>

					{nonConformityStatus === "observed" && (
						<TextareaField
							className="col-span-full space-y-2"
							label="شرح عدم انطباق"
							name={QazvinIds.nonConformityDescription}
						/>
					)}

					<TextareaField
						className="col-span-full space-y-2"
						label="نتیجه نهایی بازرسی"
						name={QazvinIds.finalResult}
					/>

					<TextareaField
						className="col-span-full space-y-2 lg:col-span-6 lg:col-start-1"
						label="اظهار نظر ارزیاب گمرک"
						name={QazvinIds.customsEvaluatorComment}
					/>

					<TextareaField
						className="col-span-full space-y-2 lg:col-span-6"
						label="اظهار نظر انباردار"
						name={QazvinIds.warehouseKeeperComment}
					/>

					<div className="col-span-full space-y-2 sm:col-span-6 lg:col-span-3 lg:col-start-1">
						<label htmlFor={QazvinIds.customsEvaluatorName}>
							نام ارزیاب گمرک
						</label>
						<Input
							id={QazvinIds.customsEvaluatorName}
							{...register(QazvinIds.customsEvaluatorName)}
						/>
					</div>

					<div className="col-span-full space-y-2 sm:col-span-6 lg:col-span-3 lg:col-start-7">
						<label htmlFor={QazvinIds.warehouseKeeperName}>نام انباردار</label>
						<Input
							id={QazvinIds.warehouseKeeperName}
							{...register(QazvinIds.warehouseKeeperName)}
						/>
					</div>
				</>
			)}
		</div>
	);
}

export { QazvinFields };
