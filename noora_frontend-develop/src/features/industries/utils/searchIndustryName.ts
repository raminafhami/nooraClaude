import { ObjectType } from "@/utils/object/ObjectType";

function searchIndustryName(value: string): ObjectType<"name"> {
  return {
    name: {
      $regex: value,
      $options: value,
    },
  };
}

export { searchIndustryName };
