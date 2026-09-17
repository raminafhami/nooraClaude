import apiClient from "@/api/client";
import { PagedResult, PagedResultApiModel } from "@/models";
import { getObjectKeys } from "@/utils/object/getObjectKeys";

import { Instance } from "../models/Instance";
import { InstanceApi } from "../models/InstanceApi";
import {
	InstanceBaseQuery,
	InstancePagedQuery,
	InstanceQuery,
} from "../models/InstanceQuery";
import { parseInstance } from "../utils/parseInstance";

export async function getMyInstances(
	options?: Partial<InstanceBaseQuery>,
): Promise<Instance[]>;

export async function getMyInstances(
	options?: Partial<InstancePagedQuery>,
): Promise<PagedResult<Instance>>;

export async function getMyInstances(
	options: InstanceQuery = {},
): Promise<Instance[] | PagedResult<Instance>> {
	const searchParams = new URLSearchParams();

	let filters: any = {};
	let search: any = {};

	if (options.filters) {
		options.filters.forEach((filter) => {
			switch (filter.name) {
				default:
					if (!filter.type || filter.type === "match") {
						filters[filter.name] = filter.value;
					} else if (filter.type === "search") {
						search[filter.name] = filter.value;
					}
			}
		});

		if (filters && getObjectKeys(filters).length) {
			searchParams.set("filters", JSON.stringify(filters));
		}

		if (search && getObjectKeys(search).length) {
			searchParams.set("search", JSON.stringify(search));
		}
	}

	if (options.sort && getObjectKeys(options.sort).length) {
		searchParams.set("sort", JSON.stringify(options.sort));
	}

	if (options.props && options.props.length) {
		searchParams.set("props", options.props.join(","));
	}

	if (options.populate && options.populate.length) {
		searchParams.set("populate", options.populate.join(","));
	}

	let pageNo: number;
	let pageSize: number;
	if (options.page) {
		if (typeof options.page === "number") {
			pageNo = options.page;
			pageSize = 10;
		} else {
			pageNo = options.page.no;
			pageSize = options.page.size;
		}
	} else {
		pageNo = 0;
		pageSize = Number.MAX_SAFE_INTEGER;
	}

	searchParams.set("page", pageNo.toString());
	searchParams.set("size", pageSize.toString());

	const response = await apiClient.get<PagedResultApiModel<InstanceApi>>({
		url: "process-instances/participates",
		searchParams,
	});

	if (!options.page) {
		return parseInstance(response.result.data);
	}

	return new PagedResult(
		parseInstance(response.result.data),
		pageNo,
		pageSize,
		response.result.count,
	);
}
