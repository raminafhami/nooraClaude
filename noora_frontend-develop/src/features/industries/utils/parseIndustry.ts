import { Industry } from "../models/Industry";
import { IndustryApi } from "../models/IndustryApi";

function parseIndustry(from: IndustryApi): Industry;

function parseIndustry(from: IndustryApi[]): Industry[];

function parseIndustry(
  from: IndustryApi | IndustryApi[],
): Industry | Industry[] {
  if (Array.isArray(from)) {
    return from.map((x) => parseIndustry(x));
  }

  try {
    return {
      id: from.id,
      name: from.name,
      type: from.type,
      parentId: from.parentId
        ? typeof from.parentId === "string"
          ? from.parentId
          : from.parentId.id
        : null,
      parent: from.parentId
        ? typeof from.parentId === "object"
          ? parseIndustry(from.parentId)
          : undefined
        : null,
    };
  } catch (err: any) {
    console.info({ industry: from });
    throw new Error(err);
  }
}

export { parseIndustry };
