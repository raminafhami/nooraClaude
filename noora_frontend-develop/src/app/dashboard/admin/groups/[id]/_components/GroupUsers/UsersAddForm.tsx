"use client";

import { memo } from "react";
import { Controller, useForm } from "react-hook-form";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/form/FieldError";
import { SelectDynamic } from "@/form/select";
import { User } from "@/identity/users/models/User";
import { UserQueryFilter } from "@/identity/users/models/UserQuery";
import { UserType } from "@/identity/users/models/UserType";
import { getUsers } from "@/identity/users/services/getUsers";
import { UserService } from "@/identity/users/services/UserService";
import searchUserFullname from "@/identity/users/utils/searchUserFullname";
import { messages } from "@/messages";
import { Head } from "@/ui/Head";
import { Loading } from "@/ui/Loader";
import { compareById } from "@/utils";

import { useGroupContext } from "../GroupContext";

interface FormData {
	user: User;
}

async function getUsersByName(
	groupId: string,
	name: string,
	branchId?: string,
): Promise<User[]> {
	const filters: Partial<UserQueryFilter> = {
		type: UserType.Personnel,
		...searchUserFullname(name),
		groups: { $nin: groupId },
	};

	if (branchId) {
		filters.branchId = branchId;
	}

	return await getUsers({
		filters,
	});
}

export const UsersAddForm = memo(function UsersAddForm(): React.ReactNode {
	const { identity } = useLoggedInUser();

	const { group, users, onUsersUpdate } = useGroupContext();

	const { control, formState, handleSubmit, reset, setError } =
		useForm<FormData>({ mode: "onSubmit" });
	const { errors, isDirty, isSubmitting, isSubmitSuccessful } = formState;

	return (
		<div className="space-y-10">
			<Head.Root className="gap-x-2">
				<Head.Title text="افزودن فرد جدید به گروه" />
			</Head.Root>

			<form
				className="space-y-10"
				onSubmit={handleSubmit(async (values) => {
					try {
						const updatedUser = await UserService.update(values.user.id, {
							groups: [...(values.user.groups as string[]), group.id],
						});

						onUsersUpdate([...(users || []), values.user]);

						reset({
							user: undefined,
						});
					} catch (err: any) {
						setError("root.server", {
							message: err?.message || "Something went wrong...",
						});
					}
				})}
			>
				{!isSubmitting && isSubmitSuccessful && (
					<Alert variant="info">
						<AlertDescription>
							فرد مورد نظر با موفقیت به گروه افزوده شد.
						</AlertDescription>
					</Alert>
				)}

				{errors.root?.server && (
					<DestructiveAlert>
						<AlertDescription>{errors.root.server.message}</AlertDescription>
					</DestructiveAlert>
				)}

				<div className="grid grid-cols-1 gap-y-4">
					<div className="flex gap-x-2">
						<label className="shrink-0 basis-28 py-2" htmlFor="user">
							نام فرد:
						</label>
						<div className="grow">
							<Controller
								name="user"
								control={control}
								render={({ field: { value, onBlur, onChange } }) => (
									<SelectDynamic<User>
										id="user"
										value={value}
										onCompare={compareById}
										onLabel={(x) => x.fullname}
										onLeave={onBlur}
										onMutate={onChange}
										onSearch={async (v) => {
											return v
												? await getUsersByName(
														group.id,
														v,
														identity.branchId !== null
															? group.metadata.branchId
															: undefined,
													)
												: [];
										}}
									/>
								)}
								rules={{ required: messages.validation.required }}
							/>
							<FieldError error={errors["user"]} />
						</div>
					</div>
				</div>

				<div className="ms-28 flex gap-x-3 ps-2">
					<Button className="min-w-[6rem]" disabled={isSubmitting || !isDirty}>
						{isSubmitting ? (
							<Loading horizontalPlacement="center" intent="white" size="xs" />
						) : (
							"افزودن"
						)}
					</Button>
				</div>
			</form>
		</div>
	);
});
