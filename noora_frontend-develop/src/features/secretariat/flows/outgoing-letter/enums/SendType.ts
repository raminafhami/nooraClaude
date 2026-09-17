import { SelectItemType } from "@/types/SelectItem";
import { getObjectEntries } from "@/utils/object/getObjectEntries";
import { ObjectType } from "@/utils/object/ObjectType";

enum SendType {
	Email = "email",
	Physical = "physical",
	Other = "other",
}

const sendType: ObjectType<SendType, { title: string }> = {
	[SendType.Email]: { title: "ارسال از طریق پست الکترونیکی" },
	[SendType.Physical]: { title: "ارسال توسط پیک" },
	[SendType.Other]: { title: "سایر" },
};

const sendTypeOptions: SelectItemType<SendType>[] = getObjectEntries(
	sendType,
).map(([key, { title }]) => ({
	value: key,
	label: title,
}));

export { SendType, sendType, sendTypeOptions };
