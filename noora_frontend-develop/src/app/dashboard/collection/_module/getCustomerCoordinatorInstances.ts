import moment from "jalali-moment";

import apiClient from "@/api/client";

import { InpectionReports } from "../../inspection/_module/instance-search/models/inpectionReportsTypes";
import { CollectionQuery } from "./CollectionQuery";

interface getCustomerCoordinatorInstancesProps {
	branchId: string | null;
	page: number;
	size: number;
	searchAttribute?: CollectionQuery;
	download?: number;
}

async function getCustomerCoordinatorInstances({
	branchId,
	page,
	size,
	searchAttribute,
	download,
}: getCustomerCoordinatorInstancesProps) {
	const filters: any = {};

	if (branchId) {
		filters.$or = [
			{ "parameters.Branch.id": branchId },
			{ "parameters.BranchId": branchId },
		];
	} else {
		if (searchAttribute?.branch) {
			filters.$or = [
				{
					"parameters.Branch.id": searchAttribute?.branch.map(
						(branch) => branch.value,
					),
				},
				{
					"parameters.BranchId": searchAttribute?.branch.map(
						(branch) => branch.value,
					),
				},
			];
		}
	}

	searchAttribute?.customer &&
		(filters["parameters.Assignees.customer.id"] =
			searchAttribute?.customer?.id);

	searchAttribute?.coordinator &&
		(filters["parameters.Assignees.coordinator.id"] =
			searchAttribute?.coordinator?.id);

	searchAttribute?.marketer &&
		(filters["parameters.Assignees.marketer.id"] =
			searchAttribute?.marketer?.id);

	if (searchAttribute?.createdFromDate || searchAttribute?.createdToDate) {
		filters["createdAt"] = {};
		if (searchAttribute?.createdFromDate) {
			filters["createdAt"].$gte = moment(
				searchAttribute.createdFromDate,
			).format("YYYY-MM-DD");
		}
		if (searchAttribute?.createdToDate) {
			filters["createdAt"].$lte = moment(searchAttribute.createdToDate).format(
				"YYYY-MM-DD",
			);
		}
	}

	if (searchAttribute?.completedFromDate || searchAttribute?.completedToDate) {
		filters["timeCompleted"] = {};
		if (searchAttribute?.completedFromDate) {
			filters["timeCompleted"].$gte = moment(searchAttribute.completedFromDate)
				.utc()
				.startOf("day")
				.valueOf();
		}
		if (searchAttribute?.completedToDate) {
			filters["timeCompleted"].$lte = moment(searchAttribute.completedToDate)
				.utc()
				.endOf("day")
				.valueOf();
		}
	}

	const link = `process-instances/customer-coordinator?${
		page ? `page=${page}` : `page=${0}`
	}&${size ? `size=${size}` : `size=${10}`}${
		filters ? `&filters=${JSON.stringify(filters)}` : ""
	}&sort=${JSON.stringify({
		createdAt: "desc",
	})}&download=${download}`;

	if (download === 1) {
		const response = await apiClient.send(
			// <{
			// data: InpectionReports[];
			// count: number;
			// inspectionFeeInRialSum: number;
			// }>
			{
				url: link,
				responseType: "blob",
			},
		);

		return response;
	} else {
		const response = await apiClient.get<{
			data: InpectionReports[];
			count: number;
			invoiceTotalSum: number;
			unpaidAmountSum: number;
		}>({
			url: link,
		});

		return response;
	}
}

export { getCustomerCoordinatorInstances };
