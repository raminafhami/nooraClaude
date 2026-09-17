import { useMemo } from "react";
import { Controller, useFormContext } from "react-hook-form";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { FieldError } from "@/form/FieldError";
import { SelectDynamic } from "@/form/select/SelectDynamic";
import { UserQueryFilter } from "@/identity/users/models/UserQuery";
import { UserType } from "@/identity/users/models/UserType";
import { getUsers } from "@/identity/users/services/getUsers";
import searchUserFullname from "@/identity/users/utils/searchUserFullname";
import { messages } from "@/messages";
import { compareById } from "@/utils/Comparators";

interface Props {
	disabled?: boolean;
	required?: boolean;
}

function CustomerSelect({ disabled, required = true }: Props) {
	const { identity } = useLoggedInUser();

	const { control } = useFormContext();

	const filters: Partial<UserQueryFilter> = useMemo(() => {
		const filters: Partial<UserQueryFilter> = {};

		// if (identity.branchId) {
		//   filters.push({ name: "branchId", value: identity.branchId });
		// }
		if (identity.branchId !== null) {
			filters.branchId = identity.branchId;
		}

		return filters;
	}, [identity.branchId]);

	return (
		<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
			<label htmlFor="Assignees.customer">مشتری:</label>
			<Controller
				control={control}
				name="Assignees.customer"
				render={({ field: { onBlur, onChange, ...field }, fieldState }) => (
					<>
						<SelectDynamic<Assignee>
							disabled={disabled}
							id={field.name}
							onCompare={compareById}
							onLabel={(x) => x.name}
							onLeave={onBlur}
							onMutate={onChange}
							onSearch={async (value) => await loadCustomers(value, filters)}
							{...field}
						/>
						<FieldError error={fieldState.error} />
					</>
				)}
				rules={{ required: required && messages.validation.required }}
			/>
		</div>
	);
}

async function loadCustomers(name: string, filters: Partial<UserQueryFilter>) {
	if (!name) {
		return [];
	}

	const users = await getUsers({
		filters: {
			...filters,
			// type: UserType.Public,
			type: { $ne: UserType.System },
			...searchUserFullname(name),
		},
		pagination: { page: 0, pageSize: 100 },
	});

	return users.items.map((user) => ({
		id: user.id,
		name: user.fullname,
	}));
}

interface Assignee {
	id: string;
	name: string;
}

export default CustomerSelect;
