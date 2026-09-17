import docxGenerator from "@/docx/docxGenerator";
import { Instance } from "@/felo/instances/models/Instance";

import { ids } from "../models/Ids";

function downloadCertificateWord(instance: Instance) {
	const wordBankLetterData = {
		issueNo: instance.parameters[ids.certificateIssueNo] || "-",
		issueDate: instance.parameters[ids.certificateIssueDate] || "-",
		buyerNameEn: instance.parameters[ids.buyerNameEn],
		seller: instance.parameters[ids.seller],
		applicant: instance.parameters[ids.applicant],
		shipper: instance.parameters[ids.shipper],
		proformaNo: instance.parameters[ids.proformaNo],
		proformaDate: instance.parameters[ids.proformaDate],
		invoiceNo: instance.parameters[ids.invoiceNo],
		invoiceDate: instance.parameters[ids.invoiceDate],
		registrationOrderNo: instance.parameters[ids.registrationOrderNo],
		insuranceCompany: instance.parameters[ids.insuranceCompany],
		insurancePolicyNo: instance.parameters[ids.insurancePolicyNo],
		billOfLadingNo: instance.parameters[ids.billOfLadingNo],
		billOfLadingDate: instance.parameters[ids.billOfLadingDate],
		billOfLadingQuantity: instance.parameters[ids.billOfLadingQuantity],
		grossWeight: instance.parameters[ids.grossWeight],
		netWeight: instance.parameters[ids.netWeight],
		packing: instance.parameters[ids.packing],
		shippedFrom: instance.parameters[ids.shippedFrom],
		shippedTo: instance.parameters[ids.shippedTo],
		countryOfOrigin: instance.parameters[ids.countryOfOrigin],
		inspectionPlace: instance.parameters[ids.inspectionPlace],
		inspectionDate: instance.parameters[ids.inspectionDate],
		inspectionQualityDescription:
			instance.parameters[ids.inspectionQualityDescription],
		inspectionRemarkDescription:
			instance.parameters[ids.inspectionRemarkDescription],
		certificateConclusion: instance.parameters[ids.certificateConclusion],
		caseNo: instance.caseNo,
		goodsDescriptions: instance.parameters[ids.goodsDescriptions]
			.split(",")
			.join(", "),
		goodsCustomTariffNo: instance.parameters[ids.goodsCustomTariffNos]
			.split(",")
			.join(", "),
	};

	docxGenerator({
		docxPath: "/docx/inspection/ic/Certificate.docx",
		outPutFileName: `${instance.caseNo} Certificate${
			instance.parameters[ids.certificateIssueNo] ? "" : " (Draft)"
		}`,
		data: wordBankLetterData,
	});
}

export { downloadCertificateWord };
