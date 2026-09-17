import { SelectItemType } from "@/types/SelectItem";
import { getObjectEntries } from "@/utils/object/getObjectEntries";
import { ObjectType } from "@/utils/object/ObjectType";

enum InstanceStatus {
	Active = "active",
	OnHold = "on-hold",
	Completed = "completed",
	Canceled = "cancelled",
}

const instanceStatus: ObjectType<InstanceStatus> = {
	[InstanceStatus.Active]: "در حال اجرا",
	[InstanceStatus.OnHold]: "متوقف شده",
	[InstanceStatus.Completed]: "پایان یافته",
	[InstanceStatus.Canceled]: "لغو شده",
};

const instanceStatusOptions: SelectItemType<InstanceStatus>[] =
	getObjectEntries(instanceStatus).map(([key, title]) => ({
		value: key,
		label: title,
	}));

export { InstanceStatus, instanceStatus, instanceStatusOptions };
