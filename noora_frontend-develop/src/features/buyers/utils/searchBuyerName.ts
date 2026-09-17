import { ObjectType } from "@/utils/object/ObjectType";

function searchBuyerName(value: string): ObjectType<"$or"> {
  return {
    $or: [
      { name: { $regex: value, $options: "i" } },
      { "metadata.nameEn": { $regex: value, $options: "i" } },
    ],
  };
}

export { searchBuyerName };
