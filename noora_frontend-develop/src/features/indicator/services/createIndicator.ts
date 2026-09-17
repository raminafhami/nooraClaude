import apiClient from "@/api/client";

import { Indicator } from "../models/Indicator";

interface CreateIndicatorDto {
  title: string;
  key: string;
  format: string;
  counter: number;
}

interface CreateIndicatorApi {
  title: string;
  key: string;
  format: string;
  counter: number;
}

async function createIndicator(
  details: CreateIndicatorDto,
): Promise<Indicator> {
  const data: CreateIndicatorApi = {
    title: details.title,
    key: details.key,
    format: details.format,
    counter: details.counter,
  };

  const response = await apiClient.post<Indicator>({
    url: "/indicator",
    body: data,
  });

  return response.result;
}

export { createIndicator };
