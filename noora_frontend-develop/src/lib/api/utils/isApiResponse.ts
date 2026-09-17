import { ApiResponse } from "../models/ApiResponse";

function isApiResponse<T = any>(obj?: any): obj is ApiResponse<T> {
  if (!obj || typeof obj !== "object") {
    return false;
  }

  return (
    obj.success !== undefined &&
    obj.statusCode !== undefined &&
    obj.message !== undefined
  );
}

export { isApiResponse };
