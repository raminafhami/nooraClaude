import { Badge } from "@/components/ui/badge";

import { FormStatus } from "@/formBuilder/enums/FormStatus";

const STATUS_LABEL: Record<FormStatus, string> = {
	[FormStatus.Draft]: "پیش‌نویس",
	[FormStatus.Published]: "منتشرشده",
	[FormStatus.Archived]: "بایگانی‌شده",
};

const STATUS_VARIANT: Record<
	FormStatus,
	"default" | "secondary" | "outline" | "destructive"
> = {
	[FormStatus.Draft]: "secondary",
	[FormStatus.Published]: "default",
	[FormStatus.Archived]: "outline",
};

function FormStatusBadge({ status }: { status: FormStatus }) {
	return <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>;
}

export { FormStatusBadge, STATUS_LABEL };
