import apiClient from "@/api/client";

import { Indicator } from "../models/Indicator";

async function getIndicatorById(id: string): Promise<Indicator | null> {
  const response = await apiClient.get<Indicator>({
    url: `/indicator/${id}`,
  });

  return response.result;
}

export { getIndicatorById };
