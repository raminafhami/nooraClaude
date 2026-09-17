import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { courseStatus, CourseStatus } from "../enums/CourseStatus";

function CourseStatusBadge({ status }: { status: CourseStatus }) {
	return (
		<Badge
			className={cn(
				"bg-gray-50 text-gray-900",
				status === CourseStatus.Started && "bg-blue-100 text-blue-900",
				status === CourseStatus.Ended && "bg-green-100 text-green-900",
			)}
		>
			{courseStatus[status].title}
		</Badge>
	);
}

export { CourseStatusBadge };
