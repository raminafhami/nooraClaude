import { ids } from "./models/Ids";

const CERTIFICATE_KEYS = [
	ids.applicant,
	ids.billOfLadingDate,
	ids.billOfLadingNo,
	ids.billOfLadingQuantity,
	ids.buyerNameEn,
	ids.certificateConclusion,
	ids.certificateIssueDate,
	ids.certificateIssueNo,
	ids.countryOfOrigin,
	ids.goodsCustomTariffNos,
	ids.goodsDescriptions,
	ids.grossWeight,
	ids.inspectionDate,
	ids.inspectionQualityDescription,
	ids.inspectionRemarkDescription,
	ids.insuranceCompany,
	ids.insurancePolicyNo,
	ids.invoiceDate,
	ids.invoiceNo,
	ids.netWeight,
	ids.packing,
	ids.inspectionPlace,
	ids.proformaDate,
	ids.proformaNo,
	ids.registrationOrderNo,
	ids.seller,
	ids.shipper,
	ids.shippedFrom,
	ids.shippedTo,
];

const CERTIFICATE_TEMPLATE = "inspection/ic/Certificate.html";

export {
	CERTIFICATE_KEYS as IC_CERTIFICATE_KEYS,
	CERTIFICATE_TEMPLATE as IC_CERTIFICATE_TEMPLATE,
};
