"use client";

import { FormItem, FormLabel } from "@/components/ui/form";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";

import { ids } from "../models/Ids";
import { CustomsTariffNosItemList } from "./CustomsTariffNosItemList";

function CustomsTariffNosList() {
	const { task } = useTaskContext();

	return (
		<FormItem className="col-span-full !col-start-1 xl:col-span-9">
			<FormLabel>کد تعرفه گمرکی</FormLabel>

			<CustomsTariffNosItemList codes={task.data[ids.customsTariffNos]} />
		</FormItem>
	);
}

export { CustomsTariffNosList };
