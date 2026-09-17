import { HttpMethod } from "./HttpMethod";

interface RequestParams {
  method?: HttpMethod;
  url: string;
  searchParams?: any;
  body?: any;
  contentType?: "json" | "multipart" | (string & {});
  headers?: HeadersInit;
  responseType?: "json" | "blob" | "text";
}

export { type RequestParams };
