import docxGenerator from "@/docx/docxGenerator";
import { Instance } from "@/felo/instances/models/Instance";
import { toFarsiNum } from "@/utils/string/toFarsiNum";

import { ids } from "../models/Ids";

function downloadCertificateWord(instance: Instance) {
	const certificateData = {
		buyer: instance.parameters[ids.buyer].name,
		certificateConclusion: instance.parameters[ids.certificateConclusion],
		certificateIssueDate: toFarsiNum(
			instance.parameters[ids.certificateIssueDate],
		),
		certificateIssueNo: instance.parameters[ids.certificateIssueNo] || "-",
		certificateQualityDescription:
			instance.parameters[ids.certificateQualityDescription],
		certificateRemarkDescription:
			instance.parameters[ids.certificateRemarkDescription],
		creditDocumentExpireDate: toFarsiNum(
			instance.parameters[ids.creditDocumentExpireDate],
		),
		creditDocumentNo: toFarsiNum(instance.parameters[ids.creditDocumentNo]),
		creditDocumentStartDate: toFarsiNum(
			instance.parameters[ids.creditDocumentStartDate],
		),
		creditNegotiatingBankBranch: toFarsiNum(
			instance.parameters[ids.creditNegotiatingBankBranch],
		),
		creditNegotiatingBankName:
			instance.parameters[ids.creditNegotiatingBankName],
		creditOpeningBankBranch: toFarsiNum(
			instance.parameters[ids.creditOpeningBankBranch],
		),
		creditOpeningBankName: instance.parameters[ids.creditOpeningBankName],
		goodsDescriptions: instance.parameters[ids.goodsDescriptions],
		goodsGrossWeight: toFarsiNum(instance.parameters[ids.goodsGrossWeight]),
		goodsShippingBasis: instance.parameters[ids.goodsShippingBasis],
		goodsShippingDestinationSite:
			instance.parameters[ids.goodsShippingDestinationSite],
		goodsShippingDueDate: toFarsiNum(
			instance.parameters[ids.goodsShippingDueDate],
		),
		goodsShippingMethod: instance.parameters[ids.goodsShippingMethod],
		goodsShippingSourceSite: instance.parameters[ids.goodsShippingSourceSite],
		inspectionDate: toFarsiNum(instance.parameters[ids.inspectionDate]),
		inspectionPlace: instance.parameters[ids.inspectionPlace],
		invoiceDate: toFarsiNum(instance.parameters[ids.invoiceDate] ?? ""),
		invoiceNo: toFarsiNum(instance.parameters[ids.invoiceNo] ?? ""),
		invoiceNoArray: instance.parameters[ids.invoiceNoArray]?.map((x: any) => ({
			date: toFarsiNum(x.date),
			no: toFarsiNum(x.no),
		})),
		proceedingsDate: toFarsiNum(instance.parameters[ids.proceedingsDate]),
		proceedingsNo: toFarsiNum(instance.parameters[ids.proceedingsNo]),
		proformaDate: toFarsiNum(instance.parameters[ids.proformaDate]),
		proformaNo: toFarsiNum(instance.parameters[ids.proformaNo]),
		seller: instance.parameters[ids.seller],
		caseNo: toFarsiNum(instance.caseNo),
		showProceedings:
			instance.parameters[ids.proceedingsDate] ||
			instance.parameters[ids.proceedingsNo],
		showOptionalDates:
			instance.parameters[ids.goodsShippingDueDate] ||
			instance.parameters[ids.creditDocumentExpireDate],
		date: toFarsiNum(new Date().toLocaleDateString("fa-IR")),
	};

	const templatePath =
		instance.version <= 5
			? "/docx/inspection/lc/Certificate.docx"
			: "/docx/inspection/lc/CertificateV6+.docx";

	docxGenerator({
		docxPath: templatePath,
		outPutFileName: `${instance.caseNo} Certificate${
			instance.parameters[ids.certificateIssueNo] ? "" : ` (Draft)`
		}`,
		data: certificateData,
	});
}

export { downloadCertificateWord };
