import { SelectItemType } from "@/types/SelectItem";
import { getObjectEntries } from "@/utils/object/getObjectEntries";
import { ObjectType } from "@/utils/object/ObjectType";

enum IndustryType {
  Main = "main",
  Sub = "sub",
}

const industryType: ObjectType<IndustryType, ObjectType<"title">> = {
  [IndustryType.Main]: { title: "صنعت" },
  [IndustryType.Sub]: { title: "زیر صنعت" },
};

const industryTypeOptions: SelectItemType[] = getObjectEntries(
  industryType,
).map(([key, { title }]) => ({ value: key, label: title }));

export { IndustryType, industryType, industryTypeOptions };
