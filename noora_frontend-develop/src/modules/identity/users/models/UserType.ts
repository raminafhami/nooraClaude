import { SelectItemType } from "@/types/SelectItem";
import { getObjectEntries } from "@/utils/object/getObjectEntries";
import { ObjectType } from "@/utils/object/ObjectType";

enum UserType {
  System = "system",
  Personnel = "personnel",
  Public = "normal",
}

const userType: ObjectType<
  UserType,
  ObjectType<"title"> & Partial<ObjectType<"visible", boolean>>
> = {
  [UserType.System]: {
    title: "سیستم",
    visible: false,
  },
  [UserType.Personnel]: {
    title: "پرسنل",
  },
  [UserType.Public]: {
    title: "مشتری",
  },
};

const userTypeOptions: SelectItemType<UserType>[] = getObjectEntries(
  userType,
).map(([key, { title, visible }]) => ({ value: key, label: title, visible }));

export { UserType, userType, userTypeOptions };
