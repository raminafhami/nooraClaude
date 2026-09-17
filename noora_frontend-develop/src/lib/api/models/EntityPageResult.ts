type EntityPageResult<T> = {
	items: T[];
	page: number;
	pageSize: number;
	total: number;
};

export type { EntityPageResult };
