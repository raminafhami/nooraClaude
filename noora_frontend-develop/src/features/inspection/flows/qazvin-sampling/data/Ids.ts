/**
 * One-stage Qazvin sampling («گزارش بازرسی و نمونه برداری تعیین ماهیت کالا»).
 * These keys are also the userTask form fields of `bpmn/qazvin-sampling.bpmn`.
 */
// prettier-ignore
export const QazvinIds = {
	buyerId: "BuyerId",
	buyerName: "BuyerName",
	buyerAddress: "BuyerAddress",
	buyerNationalId: "BuyerNationalId",
	buyerEconomicCode: "BuyerEconomicCode",
	shipmentType: "ShipmentType",
	formCode: "FormCode",
	formNo: "FormNo",
	formDate: "FormDate",
	coordinatorName: "CoordinatorName",
	customsLetterNo: "CustomsLetterNo",
	customsLetterDate: "CustomsLetterDate",
	samplingTime: "SamplingTime",
	samplingCustoms: "SamplingCustoms",
	samplingPlace: "SamplingPlace",
	samplingPlaceDetail: "SamplingPlaceDetail",
	declarationNo: "DeclarationNo",
	declarationDate: "DeclarationDate",
	warehouseReceiptNo: "WarehouseReceiptNo",
	warehouseReceiptDate: "WarehouseReceiptDate",
	goodsRows: "GoodsRows",
	goodsDescription: "GoodsDescription",
	physicalSpecs: "PhysicalSpecs",
	grossWeight: "GrossWeight",
	sampleQuantity: "SampleQuantity",
	serviceType: "ServiceType",
	serviceTitle: "ServiceTitle",
	servicePrice: "ServicePrice",
	sealType: "SealType",
	sealProductId: "SealProductId",
	sealNumber: "SealNumber",
	marking: "Marking",
	packageCount: "PackageCount",
	packageType: "PackageType",
	samplerId: "SamplerId",
	samplerName: "SamplerName",
	inspectorPersonnelNo: "InspectorPersonnelNo",
	photoStatus: "PhotoStatus",
	minPhotos: "MinPhotos",
	noPhotoReason: "NoPhotoReason",
	nonConformityStatus: "NonConformityStatus",
	nonConformityDescription: "NonConformityDescription",
	finalResult: "FinalResult",
	productOwnerName: "ProductOwnerName",
	customsEvaluatorName: "CustomsEvaluatorName",
	customsEvaluatorComment: "CustomsEvaluatorComment",
	warehouseKeeperName: "WarehouseKeeperName",
	warehouseKeeperComment: "WarehouseKeeperComment",
} as const;

export const QAZVIN_PROCESS_KEY = "QazvinSampling";

export const qazvinFieldKeys = Object.values(QazvinIds);

/** Add a row here to extend the customs-location list. */
export const customsLocations = [
	{ value: "قزوین", label: "قزوین" },
	{ value: "تهران", label: "تهران" },
	{ value: "شهریار", label: "شهریار" },
];

export const shipmentTypes = [
	{ value: "import", label: "وارداتی" },
	{ value: "export", label: "صادراتی" },
];

export const samplingPlaces = [
	{ value: "vehicleNo", label: "شماره ماشین" },
	{ value: "warehouse", label: "محل انبار" },
	{ value: "containerNo", label: "شماره کانتینر" },
	{ value: "privateWarehouse", label: "انبار اختصاصی" },
	{ value: "launchNo", label: "شماره لنج" },
	{ value: "launchName", label: "نام لنج" },
];

export const sealTypes = [
	{ value: "strap", label: "تسمه‌ای" },
	{ value: "label", label: "برچسبی" },
];

export const markingStatuses = [
	{ value: "yes", label: "دارد" },
	{ value: "no", label: "ندارد" },
];

export const photoStatuses = [
	{ value: "done", label: "انجام شد" },
	{ value: "notDone", label: "انجام نشد" },
];

export const mismatchStatuses = [
	{ value: "yes", label: "بله" },
	{ value: "no", label: "خیر" },
];
