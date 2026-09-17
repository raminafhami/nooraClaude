import { Options } from "ky";

import { getKy } from "./ky";
import {
  ApiFailureResponse,
  ApiPageResponse,
  ApiPageResult,
  ApiSuccessResponse,
} from "./models/ApiResponse";
import { EntityQuery } from "./models/EntityQuery";
import { RequestParams } from "./models/RequestParams";
import { isApiResponse } from "./utils/isApiResponse";

const ky = getKy(process.env.NEXT_PUBLIC_EXTERNAL_API_URL);

async function send<T = any>(
	params: Exclude<RequestParams, "responseType"> & { responseType: "json" },
): Promise<ApiSuccessResponse<T>>;

async function send(
	params: Exclude<RequestParams, "responseType"> & { responseType: "blob" },
): Promise<Blob>;

async function send(
	params: Exclude<RequestParams, "responseType"> & { responseType: "text" },
): Promise<string>;

async function send<T = any>(
	params: RequestParams,
): Promise<ApiSuccessResponse<T> | Blob | string> {
	const {
		method = "get",
		url,
		searchParams,
		body,
		contentType = "json",
		headers,
		responseType = "json",
	} = params;

	try {
		const options: Options = {
			method,
			searchParams,
			headers,
			cache: "no-store",
		};

		if (contentType === "json") {
			options.body = JSON.stringify(body);
			options.headers = {
				...options.headers,
				"content-type": "application/json",
			};
		} else if (contentType === "multipart") {
			if (typeof body === "object" && !(body instanceof FormData)) {
				const formdata = new FormData();
				Object.keys(body).forEach((k) => {
					if (body[k]) {
						formdata.append(k, body[k]);
					}
				});

				options.body = formdata;
			} else {
				options.body = body;
			}

			// header should not be set based on https://muffinman.io/blog/uploading-files-using-fetch-multipart-form-data/
			// options.headers = {
			//   ...options.headers,
			//   "content-type": "multipart/form-data",
			// };
		} else {
			options.body = body;
		}

		const sanitizedUrl = url.startsWith("/") ? url.substring(1) : url;

		const response = await ky(sanitizedUrl, options);

		if (responseType === "text") {
			return await response.text();
		} else if (responseType === "blob") {
			return await response.blob();
		} else {
			const jsonResponse = await response.json<ApiSuccessResponse<T>>();
			return { ...jsonResponse, success: true };
		}
	} catch (error: any) {
		if (error.name === "HTTPError") {
			const { statusCode, message, errors } = await error.response.json();

			const response: ApiFailureResponse = {
				success: false,
				statusCode,
				message,
				errors: errors ?? [],
			};

			throw response;
		}

		throw error;
	}
}

async function get<T = any>(
	params: Omit<
		RequestParams,
		"method" | "body" | "contentType" | "responseType"
	>,
): Promise<ApiSuccessResponse<T>> {
	return await send({ ...params, method: "get", responseType: "json" });
}

async function post<T = any>(
	params: Omit<RequestParams, "method" | "responseType">,
): Promise<ApiSuccessResponse<T>> {
	return await send({ ...params, method: "post", responseType: "json" });
}

async function put<T = any>(
	params: Omit<RequestParams, "method" | "responseType">,
): Promise<ApiSuccessResponse<T>> {
	return await send({ ...params, method: "put", responseType: "json" });
}

async function patch<T = any>(
	params: Omit<RequestParams, "method" | "responseType">,
): Promise<ApiSuccessResponse<T>> {
	return await send({ ...params, method: "patch", responseType: "json" });
}

async function remove<T = any>(
	params: Omit<RequestParams, "method" | "responseType">,
): Promise<ApiSuccessResponse<T>> {
	return await send<T>({ ...params, method: "delete", responseType: "json" });
}

async function query<
	T = any,
	TFilter extends string = string,
	TSort extends string = string,
	TPopulate extends string = string,
	TProjection extends string = string,
>(
	params: Omit<
		RequestParams,
		"method" | "body" | "contentType" | "responseType"
	> & {
		queryOptions: EntityQuery<TFilter, TSort, TPopulate, TProjection>;
		$and?: boolean;
	},
): Promise<ApiPageResponse<T>> {
	const { queryOptions: options, $and = true } = params;

	const searchParams: any = {};

	searchParams.page = options.pagination?.page ?? 0;
	searchParams.size =
		options.pagination?.pageSize && options.pagination.pageSize !== -1
			? options.pagination.pageSize
			: Number.MAX_SAFE_INTEGER;

	if (options.filters && Object.keys(options.filters).length) {
		searchParams.filters = JSON.stringify(
			$and
				? {
						$and: Object.entries(options.filters).map(([key, value]) => ({
							[key]: value,
						})),
					}
				: options.filters,
		);
	}

	if (options.sort) {
		searchParams.sort = JSON.stringify(options.sort);
	}

	if (options.populate && options.populate.length) {
		searchParams.populate = options.populate.join(" ");
	}

	if (options.projection && options.projection.length) {
		searchParams.projection = options.projection.join(" ");
	}

	return await get<ApiPageResult<T>>({
		...params,
		searchParams: { ...(params.searchParams ?? {}), ...searchParams },
	});
}

async function call<T>(fn: () => Promise<T>): Promise<T> {
	try {
		return await fn();
	} catch (err: unknown) {
		if (isApiResponse(err)) {
			throw new Error(
				("errors" in err && err.errors?.join("; ")) || err.message || undefined,
			);
		}

		throw err;
	}
}

const apiClient = { send, get, post, put, patch, delete: remove, query, call };

export default apiClient;
