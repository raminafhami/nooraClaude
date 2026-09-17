import { SelectItemType } from "@/types/SelectItem";
import { getObjectEntries } from "@/utils/object/getObjectEntries";
import { ObjectType } from "@/utils/object/ObjectType";

enum ContractStatus {
	Draft = "draft",
	Pending = "pending",
	Signed = "signed",
	Active = "active",
	Expired = "expired",
	Canceled = "canceled",
}

const contractStatus: ObjectType<ContractStatus, { title: string }> = {
	[ContractStatus.Draft]: {
		title: "پیش نویس",
	},
	[ContractStatus.Pending]: {
		title: "در انتظار بررسی",
	},
	[ContractStatus.Signed]: {
		title: "امضا شده",
	},
	[ContractStatus.Active]: {
		title: "فعال",
	},
	[ContractStatus.Expired]: {
		title: "منقضی شده",
	},
	[ContractStatus.Canceled]: {
		title: "لغو شده",
	},
};

const contractStatusOptions: SelectItemType<ContractStatus>[] =
	getObjectEntries(contractStatus).map(([key, { title }]) => ({
		value: key,
		label: title,
	}));

export { ContractStatus, contractStatus, contractStatusOptions };
