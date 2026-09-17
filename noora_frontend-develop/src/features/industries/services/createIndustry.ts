import apiClient from "@/api/client";

import { IndustryType } from "../enums/IndustryType";
import { Industry } from "../models/Industry";
import { IndustryApi } from "../models/IndustryApi";
import { parseIndustry } from "../utils/parseIndustry";

interface CreateIndustryDto {
  name: string;
  type: IndustryType;
  parentId: string | null;
}

type CreateIndustryApi = {
  name: string;
  type: IndustryType;
  parentId: string | null;
};

async function createIndustry(input: CreateIndustryDto): Promise<Industry> {
  const data: CreateIndustryApi = {
    name: input.name.trim(),
    type: input.type,
    parentId: input.parentId,
  };

  const response = await apiClient.post<IndustryApi>({
    url: "industry",
    body: data,
  });

  return parseIndustry(response.result);
}

export { createIndustry };
