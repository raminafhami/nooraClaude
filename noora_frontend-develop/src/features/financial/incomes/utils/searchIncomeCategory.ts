import { ObjectType } from "@/utils/object/ObjectType";

function searchIncomeCategory(value: string): ObjectType<"category"> {
  return {
    category: value,
  };
}

export { searchIncomeCategory };
