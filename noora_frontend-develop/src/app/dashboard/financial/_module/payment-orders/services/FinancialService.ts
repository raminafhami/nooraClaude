import apiClient from "@/api/client";

import { FinancialSearchProps, FinancialTypes } from "../models/FinancialTypes";

interface FinancialServiceProps {
	page: number;
	size: number;
	searchAttribute?: FinancialSearchProps;
}

export default async function FinancialService({
	page,
	size,
	searchAttribute,
}: FinancialServiceProps) {
	const filters: any = {};

	const props =
		"&props=Amount,Title,Description,PaymentDate,Priority,State,ExpertState,AssistantState,UserData,ReviewDes,PayDes,ProcessType,IsCancel,Currency,PaidAmount,UserInformation";

	if (searchAttribute?.user) {
		filters["parameters.UserData"] =
			`${searchAttribute?.user.name} ${searchAttribute?.user.name}`;
	}

	if (searchAttribute?.caseNo) {
		filters["caseNo"] = `${searchAttribute?.caseNo?.trim()}`;
	}

	if (searchAttribute?.type) {
		filters["parameters.ProcessType"] = searchAttribute?.type.map(
			(type) => type.value,
		);
	}

	if (searchAttribute?.priority) {
		filters["parameters.Priority"] = searchAttribute?.priority.map(
			(type) => type.value,
		);
	}

	searchAttribute?.title &&
		(filters["parameters.Title"] = {
			$regex: searchAttribute?.title,
			$options: "i",
		});

	if (searchAttribute?.status) {
		filters["currentState"] = searchAttribute?.status.map((type) => type.value);
	}

	const link = `process-instances/financial?${
		page ? `page=${page}` : `page=${0}`
	}&${size ? `size=${size}` : `size=${10}`}${props}${
		filters ? `&filters=${JSON.stringify(filters)}` : ""
	}&sort=${JSON.stringify({
		createdAt: "desc",
	})}`;

	const response = await apiClient.get<FinancialTypes>({
		url: link,
	});

	return response;
}
