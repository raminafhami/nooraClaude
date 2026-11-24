"use client";

import { useEffect, useRef, useState } from "react";
import { Controller, useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { toast } from "sonner";

import apiClient from "@/api/client";
import GetAllProductById from "@/api/products/getAllProductById";
import GetAllProducts from "@/api/products/getAllProducts";
import GetProductHistoryByCategory from "@/api/products/getProductHistoryByCategory";
import PutProductsHistory from "@/api/products/putProductHistory";
import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { Buyer } from "@/buyers/models/Buyer";
import { getBuyerById } from "@/buyers/services/getBuyerById";
import { getBuyers } from "@/buyers/services/getBuyers";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Currency } from "@/enums/Currency";
import { addWatcherToInstance } from "@/felo/instances/services/addWatcherToInstance";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { Task } from "@/felo/tasks/models/Task";
import { FinancialCategoryType } from "@/financial/financial-category/enums/FinancialCategoryType";
import { getFinancialCategories } from "@/financial/financial-category/services/getFinancialCategories";
import { createIncome } from "@/financial/incomes/services/createIncome";
import { DateInput } from "@/form/DateInput";
import { Input } from "@/form/Input";
import { Select } from "@/form/select";
import { Textarea } from "@/form/textarea";
import { getInspectors } from "@/inspection/services/getInspectors";
import { CaseType } from "@/inspection/models/CaseType";
import { User } from "@/identity/users/models/User";
import { EffectiveSamplingPrice } from "@/sampling-price/models/SamplingPrice";
import { getEffectiveSamplingPrices } from "@/sampling-price/services/getEffectiveSamplingPrices";
import { Head } from "@/ui/Head";
import { toCurrency } from "@/utils/String";

import {
	customsLocations,
	markingStatuses,
	mismatchStatuses,
	photoStatuses,
	QazvinIds,
	QAZVIN_PROCESS_KEY,
	samplingPlaces,
	sealTypes,
	shipmentTypes,
} from "../data/Ids";
import { schema } from "./PhaseSchema";

const setOptions = {
	shouldDirty: true,
	shouldTouch: true,
	shouldValidate: true,
} as const;

const WAREHOUSE_CATEGORY = "بازرسی عملیاتی";
const FORM_PRODUCT_NAME = "فرم نمونه برداری";

function emptyGoodsRow(seed?: Record<string, string>) {
	return {
		description: seed?.description || "",
		specs: seed?.specs || "",
		country: seed?.country || "",
		weight: seed?.weight || "",
		sample: seed?.sample || "",
		sealProductId: seed?.sealProductId || "",
		seal: seed?.seal || "",
		marking: seed?.marking || "",
		packageCount: seed?.packageCount || "",
		packageType: seed?.packageType || "",
	};
}

async function loadSamplingFormCodes(): Promise<
	{ value: string; label: string }[]
> {
	const listed = await GetAllProducts({
		page: 0,
		size: 20,
		searchByName: FORM_PRODUCT_NAME,
	});
	const rows = listed?.result?.data ?? [];
	const match = rows.find(
		(row: { id?: string; name?: string }) => row.name === FORM_PRODUCT_NAME,
	);
	if (!match?.id) {
		return [];
	}

	const full = await GetAllProductById({ id: match.id });
	const stock = full?.result?.stock ?? [];
	const codes: string[] = [];
	for (const item of stock) {
		const from = Number(item.counter ?? item.startIndex);
		const to = Number(item.endIndex);
		if (!Number.isFinite(from) || !Number.isFinite(to) || to < from) {
			continue;
		}
		for (let code = from; code <= to && codes.length < 200; code += 1) {
			codes.push(String(code));
		}
	}

	return codes.map((code) => ({ value: code, label: code }));
}

type SealChoice = {
	value: string;
	label: string;
	productId: string;
	code: string;
};

function TextInput({
	label,
	name,
	dir,
	type,
	readOnly,
	className,
}: {
	label: string;
	name: string;
	dir?: "ltr" | "rtl";
	type?: string;
	readOnly?: boolean;
	className?: string;
}) {
	const { register } = useFormContext();

	return (
		<div
			className={
				className ?? "col-span-full space-y-2 sm:col-span-6 lg:col-span-3"
			}
		>
			<label htmlFor={name}>{label}</label>
			<Input
				dir={dir}
				id={name}
				readOnly={readOnly}
				type={type}
				{...register(name)}
			/>
		</div>
	);
}

function DateField({ label, name }: { label: string; name: string }) {
	const { control, setValue } = useFormContext();

	return (
		<Controller
			control={control}
			name={name}
			render={({ field }) => (
				<div className="col-span-full space-y-2 sm:col-span-6 lg:col-span-3">
					<label htmlFor={field.name}>{label}</label>
					<DateInput
						autoComplete="off"
						id={field.name}
						value={field.value}
						onMutate={(v) => setValue(field.name, v || "", setOptions)}
					/>
				</div>
			)}
		/>
	);
}

function ChoiceField({
	label,
	name,
	items,
	onPick,
	className,
}: {
	label: string;
	name: string;
	items: { value: string; label: string }[];
	onPick?: (value: string) => void;
	className?: string;
}) {
	const { control, setValue } = useFormContext();

	return (
		<Controller
			control={control}
			name={name}
			render={({ field }) => (
				<div
					className={
						className ?? "col-span-full space-y-2 sm:col-span-6 lg:col-span-3"
					}
				>
					<label htmlFor={field.name}>{label}</label>
					<Select
						id={field.name}
						items={items}
						value={field.value}
						onMutate={(v) => {
							const next = v || "";
							setValue(field.name, next, setOptions);
							onPick?.(next);
						}}
					/>
				</div>
			)}
		/>
	);
}

function NoteField({ label, name }: { label: string; name: string }) {
	const { control } = useFormContext();

	return (
		<Controller
			control={control}
			name={name}
			render={({ field }) => (
				<div className="col-span-full space-y-2">
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

function PhasePage() {
	const { identity } = useLoggedInUser();
	const { hooks, task } = useTaskContext();
	const { control, getValues, register, setValue } = useFormContext();
	const {
		fields: goodsFields,
		append: appendGoods,
		remove: removeGoods,
		replace: replaceGoods,
	} = useFieldArray({ control, name: QazvinIds.goodsRows });
	const goodsSeeded = useRef(false);

	const [buyers, setBuyers] = useState<Buyer[]>([]);
	const [samplers, setSamplers] = useState<User[]>([]);
	const [formCodes, setFormCodes] = useState<{ value: string; label: string }[]>(
		[],
	);
	const [formCodeNote, setFormCodeNote] = useState("");
	const [prices, setPrices] = useState<EffectiveSamplingPrice[]>([]);
	const [seals, setSeals] = useState<SealChoice[]>([]);
	const [sealNote, setSealNote] = useState("");

	const sealType = useWatch({ control, name: QazvinIds.sealType });
	const goodsWatch = useWatch({ control, name: QazvinIds.goodsRows }) as
		| Array<Record<string, string>>
		| undefined;
	const samplingPlace = useWatch({ control, name: QazvinIds.samplingPlace });
	const formCode = useWatch({ control, name: QazvinIds.formCode });
	const photoStatus = useWatch({ control, name: QazvinIds.photoStatus });
	const mismatch = useWatch({ control, name: QazvinIds.nonConformityStatus });
	const serviceType = useWatch({ control, name: QazvinIds.serviceType });

	const placeLabel =
		samplingPlaces.find((item) => item.value === samplingPlace)?.label ||
		"شرح محل";

	useEffect(() => {
		if (goodsSeeded.current) return;
		goodsSeeded.current = true;
		const current = getValues(QazvinIds.goodsRows);
		if (Array.isArray(current) && current.length > 0) {
			replaceGoods(current);
			return;
		}
		replaceGoods([
			emptyGoodsRow({
				description: getValues(QazvinIds.goodsDescription) || "",
				specs: getValues(QazvinIds.physicalSpecs) || "",
				weight: getValues(QazvinIds.grossWeight) || "",
				sample: getValues(QazvinIds.sampleQuantity) || "",
				sealProductId: getValues(QazvinIds.sealProductId) || "",
				seal: getValues(QazvinIds.sealNumber) || "",
				marking: getValues(QazvinIds.marking) || "",
				packageCount: getValues(QazvinIds.packageCount) || "",
				packageType: getValues(QazvinIds.packageType) || "",
			}),
		]);
	}, [getValues, replaceGoods]);

	useEffect(() => {
		let cancelled = false;

		(async () => {
			try {
				const [buyerList, samplerList, codes, priceList] = await Promise.all([
					getBuyers(),
					getInspectors(identity.branchId).catch(() => [] as User[]),
					loadSamplingFormCodes().catch(() => null),
					getEffectiveSamplingPrices(QAZVIN_PROCESS_KEY, new Date()).catch(
						() => [] as EffectiveSamplingPrice[],
					),
				]);
				if (cancelled) return;
				setBuyers(buyerList);
				setSamplers(samplerList);
				setFormCodes(codes ?? []);
				setFormCodeNote(
					codes === null
						? "فهرست کد فرم از انبار دریافت نشد."
						: codes.length === 0
							? `کالای «${FORM_PRODUCT_NAME}» در انبار نیست یا شماره‌ای ندارد.`
							: "",
				);
				setPrices(priceList);
			} catch (err) {
				console.error(err);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [identity.branchId]);

	useEffect(() => {
		let cancelled = false;

		(async () => {
			if (!sealType) {
				setSeals([]);
				setSealNote("");
				return;
			}
			if (!identity.branchId) {
				setSeals([]);
				setSealNote(
					"شعبه کاربر مشخص نیست. شماره پلمپ از کدهای منتقل‌شده به شعبه خوانده می‌شود.",
				);
				return;
			}

			const typeLabel =
				sealTypes.find((item) => item.value === sealType)?.label || sealType;

			try {
				const byType = await GetProductHistoryByCategory({
					branchId: identity.branchId,
					categoryName: typeLabel,
				});
				const operational = byType?.length
					? []
					: await GetProductHistoryByCategory({
							branchId: identity.branchId,
							categoryName: WAREHOUSE_CATEGORY,
						});
				const rows = (byType?.length ? byType : operational || []).filter(
					(row) => !byType?.length && row.productName
						? row.productName.includes(typeLabel)
						: true,
				);
				if (cancelled) return;
				setSeals(
					rows.flatMap((row) =>
						(row.unUsedCodes || []).map((code) => ({
							value: `${row.productId}:${code}`,
							label: `${row.productName} — ${code}`,
							productId: row.productId,
							code: String(code),
						})),
					),
				);
				setSealNote(
					rows.length
						? ""
						: "برای این نوع، کد استفاده‌نشده‌ای در انبار شعبه نیست.",
				);
			} catch (err) {
				console.error(err);
				if (!cancelled) {
					setSeals([]);
					setSealNote("فهرست پلمپ انبار دریافت نشد.");
				}
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [identity.branchId, sealType]);

	useEffect(() => {
		if (hooks.get().length === 0) {
			hooks.registerHook(
				"pre-submit",
				async ({ task, data }: { task: Task; data: Record<string, any> }) => {
					if (!Array.isArray(data[QazvinIds.goodsRows])) {
						data[QazvinIds.goodsRows] = [];
					}
					for (const key of Object.keys(schema.shape)) {
						if (key === QazvinIds.goodsRows) continue;
						if (data[key] === undefined || data[key] === null) {
							data[key] = "";
						}
					}

					const rows = data[QazvinIds.goodsRows].filter((row) =>
						Object.values(row || {}).some((value) => String(value || "").trim()),
					);
					data[QazvinIds.goodsRows] = rows;
					const first = rows[0];
					if (first) {
						data[QazvinIds.goodsDescription] = first.description || "";
						data[QazvinIds.physicalSpecs] = first.specs || "";
						data[QazvinIds.grossWeight] = first.weight || "";
						data[QazvinIds.sealNumber] = first.seal || "";
						data[QazvinIds.sealProductId] = first.sealProductId || "";
						data[QazvinIds.marking] = first.marking || "";
						data[QazvinIds.packageCount] = first.packageCount || "";
						data[QazvinIds.packageType] = first.packageType || "";
					}
					const quantity = rows.reduce(
						(sum, row) => sum + (Number(row.sample) || 0),
						0,
					);
					if (quantity) {
						data[QazvinIds.sampleQuantity] = String(quantity);
					}

					data["CaseType"] = CaseType.Official;
					if (data[QazvinIds.buyerId]) {
						const buyer = await getBuyerById(data[QazvinIds.buyerId]);
						if (!buyer) {
							throw new Error("خریدار این پرونده پیدا نشد.");
						}
						data["Buyer"] = buyer;
					}

					const offered = await getEffectiveSamplingPrices(
						task.processKey || QAZVIN_PROCESS_KEY,
						new Date(),
					).catch(() => [] as EffectiveSamplingPrice[]);
					const selected = offered.find((item) => item.id === data[QazvinIds.serviceType]);
					if (offered.length > 0 && !selected) {
						throw new Error("نوع خدمت را از فهرست قیمت نمونه‌برداری انتخاب کنید.");
					}
					if (selected) {
						data[QazvinIds.serviceTitle] = selected.title;
						data[QazvinIds.servicePrice] = String(selected.price);
						const quantity = Number(data[QazvinIds.sampleQuantity]) || 1;
						const category = await getFinancialCategories({
							filters: { type: FinancialCategoryType.Income, key: "sampling" },
						}).then((categories) => categories.at(0));
						if (!category) {
							throw new Error("عنوان درآمدی نمونه برداری یافت نشد.");
						}
						await createIncome({
							instanceId: task.instanceId,
							title: category.title,
							categoryId: category.id,
							amount: selected.price * quantity,
							currency: Currency.Rial,
							currencyRate: 1,
							description: "",
						});
					}

					const usedSeals = new Map<string, number[]>();
					for (const row of rows) {
						const sealCode = Number(row.seal);
						if (row.sealProductId && Number.isFinite(sealCode)) {
							const codes = usedSeals.get(row.sealProductId) || [];
							if (!codes.includes(sealCode)) codes.push(sealCode);
							usedSeals.set(row.sealProductId, codes);
						}
					}
					if (usedSeals.size) {
						await PutProductsHistory({
							historyItems: [...usedSeals.entries()].map(
								([productId, usedCodes]) => ({ productId, usedCodes }),
							),
						});
					}

					if (data[QazvinIds.samplerId]) {
						await addWatcherToInstance(task.instanceId, data[QazvinIds.samplerId]);
					}
				},
			);
		}
	}, [hooks]);

	async function applyBuyer(id: string) {
		const buyer = buyers.find((item) => item.id === id);
		setValue(QazvinIds.buyerId, id, setOptions);
		setValue(QazvinIds.buyerName, buyer?.name || "", setOptions);
		setValue(QazvinIds.buyerAddress, buyer?.address || "", setOptions);
		setValue(QazvinIds.buyerNationalId, buyer?.nationalCode || "", setOptions);
		// Buyer records have no separate economic-code field.
		setValue(QazvinIds.buyerEconomicCode, "", setOptions);
	}

	async function applySampler(id: string) {
		const sampler = samplers.find((item) => item.id === id);
		setValue(QazvinIds.samplerId, id, setOptions);
		setValue(QazvinIds.samplerName, sampler?.fullname || "", setOptions);
		if (!id) {
			setValue(QazvinIds.inspectorPersonnelNo, "", setOptions);
			return;
		}
		try {
			const response = await apiClient.get<{ personnelCode?: string }>({
				url: `/personnel/${id}`,
			});
			setValue(
				QazvinIds.inspectorPersonnelNo,
				response.result?.personnelCode || "",
				setOptions,
			);
		} catch {
			setValue(QazvinIds.inspectorPersonnelNo, "", setOptions);
		}
	}

	const selectedPrice = prices.find((item) => item.id === serviceType);

	return (
		<div className="grid grid-cols-1 gap-y-6 sm:grid-cols-12 sm:gap-x-10">
			<div className="col-span-full">
				<Head.Root>
					<Head.Title text="گزارش بازرسی و نمونه برداری تعیین ماهیت کالا" />
				</Head.Root>
			</div>

			<Alert className="col-span-full">
				<AlertDescription>
					کد فرم از کالای «{FORM_PRODUCT_NAME}» در انبار خوانده می‌شود. شماره پلمپ
					از کدهای استفاده‌نشده‌ای است که در انبار به شعبه منتقل شده‌اند.
				</AlertDescription>
			</Alert>

			<Controller
				control={control}
				name={QazvinIds.buyerId}
				render={({ field }) => (
					<div className="col-span-full space-y-2 sm:col-span-6">
						<label htmlFor={field.name}>خریدار</label>
						<Select
							id={field.name}
							items={buyers.map((buyer) => ({
								value: buyer.id,
								label: buyer.name,
							}))}
							value={field.value}
							onMutate={(v) => applyBuyer(v || "")}
						/>
					</div>
				)}
			/>
			<TextInput label="نام خریدار" name={QazvinIds.buyerName} readOnly />
			<TextInput label="آدرس" name={QazvinIds.buyerAddress} readOnly />
			<TextInput
				label="شناسه ملی"
				name={QazvinIds.buyerNationalId}
				dir="ltr"
				readOnly
			/>
			<TextInput
				label="کد اقتصادی"
				name={QazvinIds.buyerEconomicCode}
				dir="ltr"
				readOnly
			/>

			<ChoiceField
				items={shipmentTypes}
				label="نوع محموله"
				name={QazvinIds.shipmentType}
			/>
			<ChoiceField
				items={
					formCode && !formCodes.some((item) => item.value === formCode)
						? [{ value: formCode, label: formCode }, ...formCodes]
						: formCodes
				}
				label="کد فرم"
				name={QazvinIds.formCode}
			/>
			{formCodeNote ? (
				<p className="col-span-full -mt-4 text-sm text-muted-foreground">
					{formCodeNote}
				</p>
			) : null}
			<TextInput label="شماره فرم" name={QazvinIds.formNo} />
			<DateField label="تاریخ فرم" name={QazvinIds.formDate} />
			<TextInput label="هماهنگ کننده" name={QazvinIds.coordinatorName} />
			<TextInput label="شماره نامه گمرک" name={QazvinIds.customsLetterNo} />
			<DateField label="تاریخ نامه گمرک" name={QazvinIds.customsLetterDate} />
			<TextInput
				dir="ltr"
				label="ساعت نمونه برداری"
				name={QazvinIds.samplingTime}
				type="time"
			/>
			<ChoiceField
				items={customsLocations}
				label="گمرک محل نمونه برداری"
				name={QazvinIds.samplingCustoms}
			/>
			<div className="col-span-full grid grid-cols-2 gap-x-10">
				<ChoiceField
					className="space-y-2"
					items={samplingPlaces}
					label="محل نمونه برداری"
					name={QazvinIds.samplingPlace}
				/>
				<TextInput
					className="space-y-2"
					label={placeLabel}
					name={QazvinIds.samplingPlaceDetail}
				/>
			</div>
			<TextInput label="شماره اظهارنامه" name={QazvinIds.declarationNo} />
			<DateField label="تاریخ اظهارنامه" name={QazvinIds.declarationDate} />
			<TextInput label="شماره قبض انبار" name={QazvinIds.warehouseReceiptNo} />
			<DateField label="تاریخ قبض انبار" name={QazvinIds.warehouseReceiptDate} />
			<ChoiceField
				items={prices.map((item) => ({
					value: item.id,
					label: `${item.title} — ${toCurrency(String(item.price))} ریال`,
				}))}
				label="نوع خدمت"
				name={QazvinIds.serviceType}
				onPick={(id) => {
					const price = prices.find((item) => item.id === id);
					setValue(QazvinIds.serviceTitle, price?.title || "", setOptions);
					setValue(
						QazvinIds.servicePrice,
						price ? String(price.price) : "",
						setOptions,
					);
				}}
			/>
			<div className="col-span-full text-sm text-muted-foreground sm:col-span-6 lg:col-span-3">
				{prices.length === 0
					? "برای این فرایند هنوز قیمتی در تب قیمت‌گذاری ثبت نشده. فرم باز می‌ماند."
					: selectedPrice
						? `قیمت پایه: ${toCurrency(String(selectedPrice.price))} ریال`
						: "قیمت را از تب قیمت‌گذاری نمونه‌برداری انتخاب کنید."}
			</div>

			<ChoiceField items={sealTypes} label="نوع پلمپ" name={QazvinIds.sealType} />
			{sealNote ? (
				<p className="col-span-full -mt-4 text-sm text-muted-foreground">{sealNote}</p>
			) : null}
			<div className="col-span-full space-y-4">
				<div className="flex items-center justify-between">
					<h3 className="text-sm font-semibold">ردیف‌های کالا</h3>
					<Button
						type="button"
						variant="outline"
						onClick={() => appendGoods(emptyGoodsRow())}
					>
						افزودن ردیف
					</Button>
				</div>
				{goodsFields.map((row, index) => {
					const current = goodsWatch?.[index] || {};
					const sealKey =
						current.sealProductId && current.seal
							? `${current.sealProductId}:${current.seal}`
							: "";
					const sealItems = seals.map((item) => ({
						value: item.value,
						label: item.label,
					}));
					if (sealKey && !sealItems.some((item) => item.value === sealKey)) {
						sealItems.unshift({ value: sealKey, label: current.seal });
					} else if (!sealKey && current.seal) {
						sealItems.unshift({ value: current.seal, label: current.seal });
					}
					return (
						<div key={row.id} className="grid grid-cols-1 gap-y-4 rounded-xl border p-4 sm:grid-cols-12 sm:gap-x-6">
							<TextInput
								label="شرح کالا"
								name={`${QazvinIds.goodsRows}.${index}.description`}
								className="col-span-full space-y-2"
							/>
							<TextInput
								label="مشخصات ظاهری و فیزیکی"
								name={`${QazvinIds.goodsRows}.${index}.specs`}
								className="col-span-full space-y-2 sm:col-span-6"
							/>
							<TextInput
								label="کشور مبدأ / کشور مقصد"
								name={`${QazvinIds.goodsRows}.${index}.country`}
								className="col-span-full space-y-2 sm:col-span-6"
							/>
							<TextInput
								label="وزن ناخالص"
								name={`${QazvinIds.goodsRows}.${index}.weight`}
							/>
							<TextInput
								label="مقدار نمونه"
								name={`${QazvinIds.goodsRows}.${index}.sample`}
							/>
							<Controller
								control={control}
								name={`${QazvinIds.goodsRows}.${index}.seal`}
								render={({ field }) => (
									<div className="col-span-full space-y-2 sm:col-span-6 lg:col-span-3">
										<label htmlFor={field.name}>شماره پلمپ</label>
										<Select
											id={field.name}
											items={sealItems}
											value={sealKey || field.value || ""}
											onMutate={(v) => {
												const choice = seals.find((item) => item.value === v);
												setValue(
													`${QazvinIds.goodsRows}.${index}.sealProductId`,
													choice?.productId || "",
													setOptions,
												);
												setValue(
													`${QazvinIds.goodsRows}.${index}.seal`,
													choice?.code || "",
													setOptions,
												);
											}}
										/>
									</div>
								)}
							/>
							<ChoiceField
								items={markingStatuses}
								label="نشانه گذاری"
								name={`${QazvinIds.goodsRows}.${index}.marking`}
							/>
							<TextInput
								label="تعداد بسته"
								name={`${QazvinIds.goodsRows}.${index}.packageCount`}
							/>
							<TextInput
								label="نوع بسته بندی"
								name={`${QazvinIds.goodsRows}.${index}.packageType`}
							/>
							<input
								type="hidden"
								{...register(`${QazvinIds.goodsRows}.${index}.sealProductId`)}
							/>
							{goodsFields.length > 1 ? (
								<div className="col-span-full">
									<Button
										type="button"
										variant="outline"
										onClick={() => removeGoods(index)}
									>
										حذف ردیف
									</Button>
								</div>
							) : null}
						</div>
					);
				})}
			</div>

			<Controller
				control={control}
				name={QazvinIds.samplerId}
				render={({ field }) => (
					<div className="col-span-full space-y-2 sm:col-span-6 lg:col-span-3">
						<label htmlFor={field.name}>نمونه بردار</label>
						<Select
							id={field.name}
							items={samplers.map((user) => ({
								value: user.id,
								label: user.fullname,
							}))}
							value={field.value}
							onMutate={(v) => applySampler(v || "")}
						/>
					</div>
				)}
			/>
			<TextInput label="نام نمونه بردار" name={QazvinIds.samplerName} readOnly />
			<TextInput
				label="شماره پرسنلی"
				name={QazvinIds.inspectorPersonnelNo}
				readOnly
			/>
			<ChoiceField
				items={photoStatuses}
				label="عکس برداری"
				name={QazvinIds.photoStatus}
			/>
			{photoStatus === "done" ? (
				<TextInput label="حداقل تعداد عکس" name={QazvinIds.minPhotos} />
			) : null}
			{photoStatus === "notDone" ? (
				<NoteField label="علت عدم عکس برداری" name={QazvinIds.noPhotoReason} />
			) : null}
			<ChoiceField
				items={mismatchStatuses}
				label="عدم انطباق مدارک گمرکی"
				name={QazvinIds.nonConformityStatus}
			/>
			{mismatch === "yes" ? (
				<NoteField
					label="شرح عدم انطباق"
					name={QazvinIds.nonConformityDescription}
				/>
			) : null}
			<NoteField label="نتیجه نهایی" name={QazvinIds.finalResult} />
			<input type="hidden" {...register(QazvinIds.sealProductId)} />
			<input type="hidden" {...register(QazvinIds.serviceTitle)} />
			<input type="hidden" {...register(QazvinIds.servicePrice)} />
		</div>
	);
}

export { PhasePage };
