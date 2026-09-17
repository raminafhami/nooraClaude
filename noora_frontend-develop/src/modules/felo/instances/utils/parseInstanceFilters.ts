import { getObjectKeys } from "@/utils/object/getObjectKeys";

import { InstanceBaseQuery } from "../models/InstanceQuery";

function parseInstanceFilters(
	searchParams: URLSearchParams,
	options: Pick<InstanceBaseQuery, "filters">,
) {
	let filters: Record<string, any> = {};
	let search: Record<string, any> = {};

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
}

export { parseInstanceFilters };
