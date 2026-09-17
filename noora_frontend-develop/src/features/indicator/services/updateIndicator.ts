import apiClient from "@/api/client";

import { Indicator } from "../models/Indicator";

interface UpdateIndicatorDto {
  title: string;
  key: string;
  format: string;
  counter: number;
}

interface UpdateIndicatorApi {
  title: string;
  key: string;
  format: string;
  counter: number;
}

async function updateIndicator(
  id: string,
  details: UpdateIndicatorDto,
): Promise<Indicator> {
  const data: Partial<UpdateIndicatorApi> = {};

  if (typeof details.title !== "undefined") data.title = details.title;
  if (typeof details.key !== "undefined") data.key = details.key;
  if (typeof details.format !== "undefined") data.format = details.format;
  if (typeof details.counter !== "undefined") data.counter = details.counter;

  const response = await apiClient.put<Indicator>({
    url: `/indicator/${id}`,
    body: data,
  });

  return response.result;
}

export { updateIndicator };
