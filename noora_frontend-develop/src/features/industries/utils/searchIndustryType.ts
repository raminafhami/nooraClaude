import { ObjectType } from "@/utils/object/ObjectType";

import { IndustryType } from "../enums/IndustryType";

function searchIndustryName(value: IndustryType): ObjectType<"type"> {
  return {
    type: value,
  };
}

export { searchIndustryName };
