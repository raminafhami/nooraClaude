import { SelectItemType } from "@/types/SelectItem";
import { getObjectEntries } from "@/utils/object/getObjectEntries";
import { ObjectType } from "@/utils/object/ObjectType";

enum UserStatus {
  Active = "active",
  Deactive = "deactive",
}

const userStatus: ObjectType<UserStatus, ObjectType<"title">> = {
  [UserStatus.Active]: {
    title: "فعال",
  },
  [UserStatus.Deactive]: {
    title: "غیرفعال",
  },
};

const userStatusOptions: SelectItemType[] = getObjectEntries(userStatus).map(
  ([key, { title }]) => ({ value: key, label: title }),
);

export { UserStatus, userStatus, userStatusOptions };
