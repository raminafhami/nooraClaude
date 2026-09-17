import { SelectItemType } from "@/types/SelectItem";
import { getObjectEntries } from "@/utils/object/getObjectEntries";
import { ObjectType } from "@/utils/object/ObjectType";

enum BuyerType {
  Natural = "natural",
  Legal = "legal",
}

const buyerType: ObjectType<BuyerType, ObjectType<"title">> = {
  [BuyerType.Natural]: { title: "حقیقی" },
  [BuyerType.Legal]: { title: "حقوقی" },
};

const buyerTypeOptions: SelectItemType[] = getObjectEntries(buyerType).map(
  ([key, { title }]) => ({ value: key, label: title }),
);

export { BuyerType, buyerType, buyerTypeOptions };
