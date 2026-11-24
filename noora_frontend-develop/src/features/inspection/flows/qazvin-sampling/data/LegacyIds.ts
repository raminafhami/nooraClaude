/**
 * Qazvin customs sampling = the customs sampling process (its fields come from
 * `customsSampling/data/Ids`) plus the fields of the Qazvin form
 * «گزارش بازرسی و نمونه برداری تعیین ماهیت کالا» (APK/PR06-FR30).
 */
// prettier-ignore
export const QazvinIds = {
	// shipment / documents (initial information)
	shipmentType: "ShipmentType", // وارداتی / صادراتی
	customsLetterNo: "CustomsLetterNo", // شماره نامه گمرک
	customsLetterDate: "CustomsLetterDate", // تاریخ نامه گمرک
	samplingTime: "SamplingTime", // ساعت نمونه برداری
	samplingCustoms: "SamplingCustoms", // گمرک محل نمونه برداری
	vehicleNo: "VehicleNo", // شماره ماشین / کانتینر / محل انبار / نام یا شماره لنج
	receiptDate: "ReceiptDate", // تاریخ قبض انبار

	// per product (inside ProductsData)
	physicalSpecs: "PhysicalSpecs", // مشخصات ظاهری و فیزیکی کالا
	grossWeight: "GrossWeight", // وزن ناخالص
	marking: "Marking", // نشانه گذاری (دارد / ندارد)
	packageCount: "PackageCount", // تعداد و نوع بسته بندی

	// inspection result (sampler)
	inspectorPersonnelNo: "InspectorPersonnelNo", // شماره پرسنلی بازرس
	photoStatus: "PhotoStatus", // عکس برداری انجام شد / نشد
	minPhotos: "MinPhotos", // حداقل عکس مورد نیاز
	noPhotoReason: "NoPhotoReason", // علت عدم عکسبرداری
	nonConformityStatus: "NonConformityStatus", // عدم انطباق مشاهده شد / نشد
	nonConformityDescription: "NonConformityDescription", // شرح عدم انطباق
	finalResult: "FinalResult", // نتیجه نهایی بازرسی
	assistantSamplerName: "AssistantSamplerName", // کمک نمونه بردار
	customsEvaluatorComment: "CustomsEvaluatorComment", // اظهار نظر ارزیاب گمرک
	customsEvaluatorName: "CustomsEvaluatorName", // نام ارزیاب گمرک
	warehouseKeeperComment: "WarehouseKeeperComment", // اظهار نظر انباردار
	warehouseKeeperName: "WarehouseKeeperName", // نام انباردار
} as const;

export const QAZVIN_PROCESS_KEY = "QazvinSampling";

/** default «گمرک محل نمونه برداری» */
export const QAZVIN_CUSTOMS = "گمرک استان قزوین";

export const shipmentTypes = [
	{ value: "import", label: "وارداتی" },
	{ value: "export", label: "صادراتی" },
];

export const doneStatuses = [
	{ value: "done", label: "انجام شد" },
	{ value: "notDone", label: "انجام نشد" },
];

export const observedStatuses = [
	{ value: "observed", label: "مشاهده شد" },
	{ value: "notObserved", label: "مشاهده نشد" },
];

export const markingStatuses = [
	{ value: "yes", label: "دارد" },
	{ value: "no", label: "ندارد" },
];

/** top-level keys added by the sampling-officer step */
export const qazvinSamplingKeys = [
	QazvinIds.shipmentType,
	QazvinIds.customsLetterNo,
	QazvinIds.customsLetterDate,
	QazvinIds.samplingTime,
	QazvinIds.samplingCustoms,
	QazvinIds.vehicleNo,
	QazvinIds.receiptDate,
] as const;

/** top-level keys added by the sampler step (it can also edit the ones above) */
export const qazvinInspectorKeys = [
	...qazvinSamplingKeys,
	QazvinIds.inspectorPersonnelNo,
	QazvinIds.photoStatus,
	QazvinIds.minPhotos,
	QazvinIds.noPhotoReason,
	QazvinIds.nonConformityStatus,
	QazvinIds.nonConformityDescription,
	QazvinIds.finalResult,
	QazvinIds.assistantSamplerName,
	QazvinIds.customsEvaluatorComment,
	QazvinIds.customsEvaluatorName,
	QazvinIds.warehouseKeeperComment,
	QazvinIds.warehouseKeeperName,
] as const;
