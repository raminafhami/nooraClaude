import { InstanceStatus } from "@/felo/instances/enums/InstanceStatus";

import { UserLookup } from "../modules/UserLookup";

export type InpectionReportsTypes = {
	inspectionType?: { value: string; label: string }[] | [];
	inspectionMethod?: { value: string; label: string }[] | undefined;
	group?: { value: string; label: string }[] | undefined;
	customName?: { value: string; label: string }[] | undefined;
	bankName?: { value: string; label: string }[] | undefined;
	invoicePaymentStatus?: { value: string; label: string }[] | undefined;
	caseType?: { value: string; label: string }[] | undefined;
	instanceStatus?: { value: string; label: string }[] | undefined;
	branch?: { value: string; label: string }[] | undefined;

	customer?: UserLookup;
	coordinator?: UserLookup;
	technicalExpert?: UserLookup;
	seniorExpert?: UserLookup;
	marketer?: UserLookup;
	billOfLadingNo?: string;
	fromDate?: Date;
	toDate?: Date;
	createdAt?: Date;
	proformaNo?: string;
	caseNo?: string;
	brand?: string;
	manufacturer?: string;
	certificateIssueNo?: string;
	inspectionPlace?: string;
	inspectorName?: string;
	goodsDescriptions?: string;
	inspectionFee?: string;
	buyer?: string;
	customTariffNoOrHsCode?: string;
	labName?: string;

	// sampling
	restraint?: string;
	cottageNo?: string;
	pageNo?: string;
};

export interface InpectionReports {
	processDefinitionId: string;
	processDefinitionKey: string;
	processDefinitionName: string;
	caseNo: string;
	hasFile: boolean;
	currentState: string;
	stateList: {
		name: string;
		title: string;
	}[];
	status: InstanceStatus;
	createdAt: string;
	updatedAt: string;
	parameters: {
		Assignees: {
			expert: {
				id: string;
				name: string;
			};
			customer: {
				id: string;
				name: string;
			};
			coordinator: {
				id: string;
				name: string;
			};
			marketer: {
				id: string;
				name: string;
			};
			reviewer: {
				id: string;
				name: string;
			};
			technicalExpert: {
				id: string;
				name: string;
			};
			inspectionCoordinator: {
				id: string;
				name: string;
			};
			manager: {
				id: string;
				name: string;
			};
		};
		InspectionFeeInRial: string;
		InvoiceTotal: string;
		InspectionMethod: string;
		Branch: {
			id: string;
			name: string;
			title: string;
			manager: any;
		};
		Buyer: {
			id: string;
			branches: {
				id: string;
				name: string;
				title: string;
				manager: any;
			}[];
			type: string;
			name: string;
			nameEn: string;
			nationalCode: string;
			phoneNo: string;
			faxNo: string;
			email: string;
			postalCode: string;
			address: string;
			sepidarId: string;
		};
		CaseType: string;
		ProformaNo: string;
		BankName: string;
		CustomName: string;
		GoodsDescriptions: string;
		GoodsField: string;
		InspectionFee: string;
		InspectionFeeCurrency: string;
		InvoicePaymentStatus: string;
		BillOfLadingNo: string;
		CertificateIssueNo: string;
		InspectionPlace: string;
		InspectorName: string;
		LabName: string;
	};
	inspectionFiles?: string[];
	id: string;
}
