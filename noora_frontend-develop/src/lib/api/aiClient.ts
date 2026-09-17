import ky, { Options } from "ky";

import { ApiFailureResponse } from "./models/ApiResponse";
import { RequestParams } from "./models/RequestParams";

const kyClient = ky.create({
	prefixUrl: "https://ai.reval.ir",
	timeout: 60000,
});

async function send<T = any>(params: RequestParams): Promise<any> {
	const { method = "post", url, searchParams, body, headers } = params;

	try {
		const options: Options = {
			method,
			searchParams,
			headers,
			cache: "no-store",
		};

		options.body = JSON.stringify(body);
		options.headers = {
			...options.headers,
			"content-type": "application/json",
		};

		const sanitizedUrl = url.startsWith("/") ? url.substring(1) : url;

		const response = await kyClient(sanitizedUrl, options);

		const jsonResponse = await response.json<T>();
		return { ...jsonResponse, success: true };
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

const aiClient = { send };

export default aiClient;
