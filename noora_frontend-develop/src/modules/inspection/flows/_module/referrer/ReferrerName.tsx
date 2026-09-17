"use client";

import { memo } from "react";

import { FormControl, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";

function ReferrerName({
	assigneeKey,
	title,
	name: n,
}: {
	assigneeKey: string;
	title?: string;
	name?: string;
}) {
	const {
		task: { data },
	} = useTaskContext();

	const name = n ?? data["Assignees"]?.[assigneeKey]?.name;

	return (
		name && (
			<FormItem className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
				<FormLabel>ارجاع دهنده{title && ` (${title})`}:</FormLabel>
				<FormControl>
					<Input disabled value={name} />
				</FormControl>
			</FormItem>
		)
	);
}

export default memo(ReferrerName);
