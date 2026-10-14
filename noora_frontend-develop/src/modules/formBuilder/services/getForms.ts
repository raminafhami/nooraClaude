import apiClient from "@/api/client";
import { EntityPageResult } from "@/api/models/EntityPageResult";

import { Form } from "../models/Form";
import { FormBaseQuery, FormPageQuery, FormQuery } from "../models/FormQuery";

async function getForms(options?: FormBaseQuery): Promise<Form[]>;

async function getForms(
	options: FormPageQuery,
): Promise<EntityPageResult<Form>>;

async function getForms(
	options: FormQuery = {},
): Promise<Form[] | EntityPageResult<Form>> {
	const response = await apiClient.query<Form>({
		url: "form-builder/forms",
		queryOptions: options,
	});

	if (!options.pagination) {
		return response.result.data;
	}

	return {
		items: response.result.data,
		page: options.pagination.page,
		pageSize: options.pagination.pageSize,
		total: response.result.count,
	};
}

export { getForms };
