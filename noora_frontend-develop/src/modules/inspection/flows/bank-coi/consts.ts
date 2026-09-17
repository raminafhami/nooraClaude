import { ids } from "./models/Ids";

const CERTIFICATE_KEYS = [
	ids.billOfLadingDate,
	ids.billOfLadingNo,
	ids.certificateConclusion,
	ids.certificateIssueDate,
	ids.certificateIssueNo,
	ids.consignee,
	ids.countryOfOrigin,
	ids.exporter,
	ids.goods,
	ids.grossWeight,
	ids.importer,
	ids.inspectionDateEnd,
	ids.inspectionDateStart,
	ids.inspectionPlace,
	ids.portOfEntry,
	ids.proformaDate,
	ids.proformaNo,
	ids.registrationOrderNo,
	ids.samplingDate,
	ids.shipper,
	ids.testDateEnd,
	ids.testDateStart,
];

const CERTIFICATE_TEMPLATE = "inspection/bank-coi/Certificate.html";

export {
	CERTIFICATE_KEYS as BANK_COI_CERTIFICATE_KEYS,
	CERTIFICATE_TEMPLATE as BANK_COI_CERTIFICATE_TEMPLATE,
};
