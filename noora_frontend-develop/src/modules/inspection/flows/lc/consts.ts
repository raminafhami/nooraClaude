import { ids } from "./models/Ids";

const CERTIFICATE_KEYS = [
	ids.buyer,
	ids.certificateConclusion,
	ids.certificateIssueDate,
	ids.certificateIssueNo,
	ids.certificateQualityDescription,
	ids.certificateRemarkDescription,
	ids.creditDocumentExpireDate,
	ids.creditDocumentNo,
	ids.creditDocumentStartDate,
	ids.creditNegotiatingBankBranch,
	ids.creditNegotiatingBankName,
	ids.creditOpeningBankBranch,
	ids.creditOpeningBankName,
	ids.goodsDescriptions,
	ids.goodsGrossWeight,
	ids.goodsShippingBasis,
	ids.goodsShippingDestinationSite,
	ids.goodsShippingDueDate,
	ids.goodsShippingMethod,
	ids.goodsShippingSourceSite,
	ids.inspectionDate,
	ids.inspectionPlace,
	ids.invoiceDate,
	ids.invoiceNo,
	ids.proformaDate,
	ids.proformaNo,
	ids.proceedingsDate,
	ids.proceedingsNo,
	ids.seller,
	ids.invoiceNoArray,
];

const CERTIFICATE_TEMPLATE_V1 = "inspection/lc/Certificate.html";
const CERTIFICATE_TEMPLATE_V2 = "inspection/lc/CertificateV6Plus.html";

export {
	CERTIFICATE_KEYS as LC_CERTIFICATE_KEYS,
	CERTIFICATE_TEMPLATE_V1 as LC_CERTIFICATE_TEMPLATE_V1,
	CERTIFICATE_TEMPLATE_V2 as LC_CERTIFICATE_TEMPLATE_V2,
};
