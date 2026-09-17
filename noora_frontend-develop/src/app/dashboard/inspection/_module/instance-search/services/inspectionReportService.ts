import apiClient from "@/api/client";

import { InpectionReportsTypes } from "../models/inpectionReportsTypes";

interface InspectionReportServiceProps {
	branchId: string | null;
	page: number;
	size: number;
	searchAttribute?: InpectionReportsTypes;
	download?: number;
}

export default async function InspectionReportService({
	branchId,
	page,
	size,
	searchAttribute,
	download,
}: InspectionReportServiceProps) {
	const filters: any = {
		$and: [
			{
				$or: [
					{ processDefinitionKey: { $regex: `^Inspection_Case` } },
					{ processDefinitionKey: { $regex: `Sampling$` } },
				],
			},
		],
	};

	const props =
		"&props=InspectionMethod,GoodsField,CustomName,BankName,InvoicePaymentStatus,CaseType,Assignees,BillOfLadingNo,ProformaNo,CertificateIssueNo,InspectionPlace,InspectorName,GoodsDescriptions,InspectionFee,Buyer,Goods,LabName,Brand,Manufacturer,InspectionFeeCurrency,InspectionFeeInRial,Branch,BranchId,InspectionInstanceId";

	if (branchId) {
		filters.$and.push({
			$or: [
				{ "parameters.Branch.id": branchId },
				{ "parameters.BranchId": branchId },
			],
		});
	} else {
		if (searchAttribute?.branch?.length) {
			filters.$and.push({
				$or: [
					{
						$and: [
							{ "parameters.Branch": { $exists: true } },
							{
								"parameters.Branch.id": searchAttribute?.branch.map((branch) =>
									branch.value === "headquarters" ? null : branch.value,
								),
							},
						],
					},
					{
						$and: [
							{ "parameters.BranchId": { $exists: true } },
							{
								"parameters.BranchId": searchAttribute?.branch.map((branch) =>
									branch.value === "headquarters" ? null : branch.value,
								),
							},
						],
					},
				],
			});
		}
	}

	if (
		searchAttribute?.inspectionType &&
		searchAttribute?.inspectionType.length > 0
	) {
		const processDefinitionKey = searchAttribute?.inspectionType.flatMap(
			(type) => {
				if (type.value === "sampling") {
					return { $regex: `Sampling$` };
				}

				if (type.value === "bank-coi") {
					return ["Inspection_Case_Bank_COI"];
				}

				return `Inspection_Case_${type.value.toUpperCase()}`;
			},
		);

		filters.$and.push({
			$or: processDefinitionKey.map((x) => ({ processDefinitionKey: x })),
		});
	}

	if (searchAttribute?.inspectionMethod) {
		filters["parameters.InspectionMethod"] =
			searchAttribute?.inspectionMethod.map((method) => method.value);
	}

	if (searchAttribute?.group) {
		filters["parameters.GoodsField"] = searchAttribute?.group.map(
			(group) => group.value,
		);
	}

	if (searchAttribute?.customName) {
		filters["parameters.CustomName"] = searchAttribute?.customName.map(
			(name) => name.value,
		);
	}

	if (searchAttribute?.bankName) {
		filters["parameters.BankName"] = searchAttribute?.bankName.map(
			(bank) => bank.value,
		);
	}

	if (searchAttribute?.invoicePaymentStatus) {
		filters["parameters.InvoicePaymentStatus"] =
			searchAttribute?.invoicePaymentStatus.map((status) => status.value);
	}

	if (searchAttribute?.caseType) {
		filters["parameters.CaseType"] = searchAttribute?.caseType.map(
			(type) => type.value,
		);
	}

	if (searchAttribute?.instanceStatus) {
		filters["status"] = searchAttribute?.instanceStatus.map(
			(type) => type.value,
		);
	}

	searchAttribute?.customer &&
		(filters["parameters.Assignees.customer.id"] =
			searchAttribute?.customer?.id);

	searchAttribute?.coordinator &&
		(filters["parameters.Assignees.coordinator.id"] =
			searchAttribute?.coordinator?.id);

	searchAttribute?.technicalExpert &&
		(filters["parameters.Assignees.technicalExpert.id"] =
			searchAttribute?.technicalExpert?.id);

	searchAttribute?.seniorExpert &&
		(filters["parameters.Assignees.seniorExpert.id"] =
			searchAttribute?.seniorExpert?.id);

	searchAttribute?.marketer &&
		(filters["parameters.Assignees.marketer.id"] =
			searchAttribute?.marketer?.id);

	searchAttribute?.billOfLadingNo &&
		(filters["parameters.BillOfLadingNo"] = searchAttribute?.billOfLadingNo);

	searchAttribute?.proformaNo &&
		(filters["parameters.ProformaNo"] = searchAttribute?.proformaNo);

	searchAttribute?.caseNo && (filters["caseNo"] = searchAttribute?.caseNo);

	searchAttribute?.certificateIssueNo &&
		(filters["parameters.CertificateIssueNo"] =
			searchAttribute?.certificateIssueNo);

	searchAttribute?.inspectionPlace &&
		(filters["parameters.InspectionPlace"] = {
			$regex: searchAttribute?.inspectionPlace,
			$options: "i",
		});

	searchAttribute?.inspectorName &&
		(filters["parameters.InspectorName"] = {
			$regex: searchAttribute?.inspectorName,
			$options: "i",
		});

	searchAttribute?.buyer &&
		(filters["parameters.Buyer.name"] = {
			$regex: searchAttribute?.buyer,
			$options: "i",
		});

	searchAttribute?.goodsDescriptions &&
		(filters["parameters.GoodsDescriptions"] = {
			$regex: searchAttribute?.goodsDescriptions,
			$options: "i",
		});

	searchAttribute?.cottageNo &&
		(filters["parameters.CottageNo"] = searchAttribute?.cottageNo);

	searchAttribute?.pageNo &&
		(filters["parameters.PageNo"] = searchAttribute?.pageNo);

	searchAttribute?.inspectionFee &&
		(filters["parameters.InspectionFee"] = {
			$regex: searchAttribute?.inspectionFee,
			$options: "i",
		});

	searchAttribute?.customTariffNoOrHsCode &&
		(filters["parameters.Goods"] = {
			$elemMatch: {
				$or: [
					{
						customTariffNoOrHsCode: {
							$regex: searchAttribute?.customTariffNoOrHsCode?.trim(),
							$options: "i",
						},
					},
					{
						qty: {
							$regex: searchAttribute?.customTariffNoOrHsCode?.trim(),
							$options: "i",
						},
					},
					{
						packingOrUnit: {
							$regex: searchAttribute?.customTariffNoOrHsCode?.trim(),
							$options: "i",
						},
					},
					{
						netWeight: {
							$regex: searchAttribute?.customTariffNoOrHsCode?.trim(),
							$options: "i",
						},
					},
					{
						grossWeight: {
							$regex: searchAttribute?.customTariffNoOrHsCode?.trim(),
							$options: "i",
						},
					},
					{
						description: {
							$regex: searchAttribute?.customTariffNoOrHsCode?.trim(),
							$options: "i",
						},
					},
					{
						document: {
							$regex: searchAttribute?.customTariffNoOrHsCode?.trim(),
							$options: "i",
						},
					},
				],
			},
		});

	searchAttribute?.labName &&
		(filters["parameters.LabName"] = {
			$regex: searchAttribute?.labName,
			$options: "i",
		});

	searchAttribute?.brand &&
		(filters["parameters.Brand"] = {
			$regex: searchAttribute?.brand,
			$options: "i",
		});

	searchAttribute?.manufacturer &&
		(filters["parameters.Manufacturer"] = {
			$regex: searchAttribute?.manufacturer,
			$options: "i",
		});

	if (searchAttribute?.fromDate || searchAttribute?.toDate) {
		filters["createdAt"] = {};
		if (searchAttribute?.fromDate) {
			filters["createdAt"].$gte = new Date(searchAttribute.fromDate);
		}
		if (searchAttribute?.toDate) {
			filters["createdAt"].$lte = new Date(searchAttribute.toDate);
		}
	}

	if (searchAttribute?.restraint) {
		filters["parameters.ProductsData"] = {
			$elemMatch: {
				PackingType: {
					$elemMatch: {
						codes: searchAttribute.restraint,
					},
				},
			},
		};
	}

	const link = `process-instances?${page ? `page=${page}` : `page=${0}`}&${
		size ? `size=${size}` : `size=${10}`
	}${props}${
		filters ? `&filters=${JSON.stringify(filters)}` : ""
	}&sort=${JSON.stringify({
		createdAt: "desc",
	})}${download ? `&download=${download}` : ""}`;

	if (download === 1) {
		const response = await apiClient.send({
			url: link,
			responseType: "blob",
		});
		return response;
	} else {
		const response = await apiClient.get({ url: link });
		return response;
	}
}
