import {
	EntityBaseQuery,
	EntityPageQuery,
	EntityQuery,
} from "@/api/models/EntityQuery";

import { Form } from "./Form";

type FormQueryFilterParam = keyof Omit<Form, "id" | "category" | "creator">;

type FormQuerySortParam = keyof Form;

type FormQueryPopulateParam =
	| "category"
	| "publishedVersion"
	| "draftVersion"
	| "creator";

type FormBaseQuery = EntityBaseQuery<
	FormQueryFilterParam,
	FormQuerySortParam,
	FormQueryPopulateParam
>;

type FormPageQuery = EntityPageQuery<
	FormQueryFilterParam,
	FormQuerySortParam,
	FormQueryPopulateParam
>;

type FormQuery = EntityQuery<
	FormQueryFilterParam,
	FormQuerySortParam,
	FormQueryPopulateParam
>;

export type {
	FormBaseQuery,
	FormPageQuery,
	FormQuery,
	FormQueryFilterParam,
	FormQueryPopulateParam,
	FormQuerySortParam,
};
