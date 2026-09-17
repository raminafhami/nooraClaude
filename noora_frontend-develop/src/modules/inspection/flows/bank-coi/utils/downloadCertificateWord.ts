import docxGenerator from "@/docx/docxGenerator";
import { Instance } from "@/felo/instances/models/Instance";

import { Goods } from "../models/Goods";
import { ids } from "../models/Ids";

function downloadCertificateWord(instance: Instance) {
	const data = {
		caseNo: instance.caseNo,
		BillOfLadingDate:
			instance.parameters[ids.billOfLadingDate]?.replaceAll("/", "-") || "-",
		BillOfLadingNo: instance.parameters[ids.billOfLadingNo],
		CertificateConclusion: instance.parameters[ids.certificateConclusion],
		CertificateIssueDate:
			instance.parameters[ids.certificateIssueDate]?.replaceAll("/", "-") ||
			"-",
		CertificateIssueNo: instance.parameters[ids.certificateIssueNo]
			? `NAIT${instance.parameters[ids.certificateIssueNo]}`
			: "-",
		Consignee: instance.parameters[ids.consignee],
		CountryOfOrigin: instance.parameters[ids.countryOfOrigin],
		Exporter: instance.parameters[ids.exporter],
		Goods:
			(instance.parameters[ids.goods] as Goods)?.map((x, i) => ({
				i: i + 1,
				q: x.qty,
				pu: x.packingOrUnit,
				d: x.description,
				c: x.customTariffNoOrHsCode,
				do: x.document,
			})) || [],
		GrossWeight: instance.parameters[ids.grossWeight],
		Importer: instance.parameters[ids.importer],
		InspectionDate:
			instance.parameters[ids.inspectionDateStart] &&
			instance.parameters[ids.inspectionDateEnd]
				? `${instance.parameters[ids.inspectionDateStart].replaceAll(
						"/",
						"-",
					)} to ${instance.parameters[ids.inspectionDateEnd].replaceAll(
						"/",
						"-",
					)}`
				: instance.parameters[ids.inspectionDateStart]
					? instance.parameters[ids.inspectionDateStart].replaceAll("/", "-")
					: "-",
		InspectionPlace: instance.parameters[ids.inspectionPlace],
		PortOfEntry: instance.parameters[ids.portOfEntry],
		ProformaDate:
			instance.parameters[ids.proformaDate].replaceAll("/", "-") || "-",
		ProformaNo: instance.parameters[ids.proformaNo],
		RegistrationOrderNo: instance.parameters[ids.registrationOrderNo],
		SamplingDate:
			instance.parameters[ids.samplingDate].replaceAll("/", "-") || "-",
		Shipper: instance.parameters[ids.shipper],
		TestDate:
			instance.parameters[ids.testDateStart] &&
			instance.parameters[ids.testDateEnd]
				? `${instance.parameters[ids.testDateStart].replaceAll(
						"/",
						"-",
					)} to ${instance.parameters[ids.testDateEnd].replaceAll("/", "-")}`
				: instance.parameters[ids.testDateStart]
					? instance.parameters[ids.testDateStart].replaceAll("/", "-")
					: "-",
	};

	docxGenerator({
		docxPath: "/docx/inspection/bank-coi/Certificate.docx",
		outPutFileName: `${instance.caseNo} Certificate${
			instance.parameters[ids.certificateIssueNo] ? "" : ` (Draft)`
		}`,
		data,
	});
}

export { downloadCertificateWord };
