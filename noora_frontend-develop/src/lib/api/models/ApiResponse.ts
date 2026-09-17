interface ApiBaseResponse {
	success: boolean;
	statusCode: number;
	message: string;
}

interface ApiFailureResponse extends ApiBaseResponse {
	success: false;
	errors?: string[];
}

interface ApiSuccessResponse<T = unknown> extends ApiBaseResponse {
	count: any;
	data(data: any): unknown;
	success: true;
	result: T;
}

interface ApiPageResponse<T = unknown>
	extends Omit<ApiSuccessResponse<T>, "result"> {
	result: ApiPageResult<T>;
}

interface ApiPageResult<T = unknown> {
	data: T[];
	count: number;
}

type ApiResponse<T = unknown> = ApiFailureResponse | ApiSuccessResponse<T>;

export type {
	ApiFailureResponse,
	ApiPageResponse,
	ApiPageResult,
	ApiResponse,
	ApiSuccessResponse,
};
