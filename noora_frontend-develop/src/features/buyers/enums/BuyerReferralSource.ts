import { SelectItemType } from "@/types/SelectItem";
import { getObjectEntries } from "@/utils/object/getObjectEntries";
import { ObjectType } from "@/utils/object/ObjectType";

enum BuyerReferralSource {
  Exhibition = "exhibition",
  Web = "web",
  Employees = "employees",
  Others = "others",
}

const buyerReferralSource: ObjectType<
  BuyerReferralSource,
  ObjectType<"title">
> = {
  [BuyerReferralSource.Exhibition]: { title: "نمایشگاه" },
  [BuyerReferralSource.Web]: { title: "وب" },
  [BuyerReferralSource.Employees]: { title: "پرسنل شرکت" },
  [BuyerReferralSource.Others]: { title: "سایر" },
};

const buyerReferralSourceOptions: SelectItemType[] = getObjectEntries(
  buyerReferralSource,
).map(([key, { title }]) => ({ value: key, label: title }));

export { BuyerReferralSource, buyerReferralSource, buyerReferralSourceOptions };
