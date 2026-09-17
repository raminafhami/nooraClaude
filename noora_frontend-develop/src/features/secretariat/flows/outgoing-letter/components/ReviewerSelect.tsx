"use client";

import { useFormContext } from "react-hook-form";

import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from "@/components/ui/form";
import { UserLookupSelect } from "@/identity/users/components/UserLookupSelect";
import { UserType } from "@/identity/users/models/UserType";
import { messages } from "@/messages";

import { Assignees, AssigneeType } from "../models/Assignee";
import { ids } from "../models/Ids";

type FormSchema = {
	[ids.assignees]: Assignees;
};

function ReviewerSelect({ required }: { required?: boolean }) {
	const { control } = useFormContext<FormSchema>();

	return (
		<FormField
			control={control}
			name={`${ids.assignees}.${AssigneeType.Reviewer}`}
			render={({ field }) => {
				return (
					<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<FormLabel>
							ارسال به<span className="text-red-600"> *</span>
						</FormLabel>
						<FormControl>
							<UserLookupSelect
								placeholder="انتخاب کاربر"
								type={UserType.Personnel}
								value={field.value}
								onValueChange={field.onChange}
							/>
						</FormControl>
					</FormItem>
				);
			}}
			rules={{ required: required && messages.validation.required }}
		/>
	);
}

export { ReviewerSelect };
