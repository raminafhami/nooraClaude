"use client";

import { memo, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { Branch } from "@/branches/models/Branch";
import { getBranches } from "@/branches/services/getBranches";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/form/FieldError";
import { Input } from "@/form/Input";
import { MaskInput } from "@/form/MaskInput";
import { Select } from "@/form/select";
import { UserGroup } from "@/identity/groups/models/Group";
import { UserGroupType } from "@/identity/groups/models/GroupType";
import { createGroup } from "@/identity/groups/services/createGroup";
import { getGroupByName } from "@/identity/groups/services/getGroupByName";
import { messages } from "@/messages";
import { Head } from "@/ui/Head";
import { Loading } from "@/ui/Loader";
import { compareById } from "@/utils";

interface Props {
	onGroupAdd: (group: UserGroup) => void;
}

interface FormData {
	branch: Branch | null;
	title: string;
	name: string;
}

export const GroupAddForm = memo(function GroupAddForm({
	onGroupAdd,
}: Props): React.ReactNode {
	const { identity } = useLoggedInUser();

	const [isFormSuccessful, setFormSuccessful] = useState<boolean>(false);
	const [branches, setBranches] = useState<Branch[]>([]);

	const { control, formState, handleSubmit, register, reset, setError } =
		useForm<FormData>({ mode: "onTouched" });
	const { errors, isDirty, isSubmitting, isSubmitSuccessful } = formState;

	useEffect(() => {
		(async () => {
			if (identity.branchId === null) {
				const branches = await getBranches({ sort: { title: "asc" } });
				setBranches(branches);
			} else {
			}
		})();
	}, [identity.branchId]);

	useEffect(() => {
		if (isSubmitSuccessful) {
			reset({
				title: "",
				name: "",
			});
		}
	}, [isSubmitSuccessful, reset]);

	return (
		<div className="space-y-10">
			<Head.Root className="gap-x-2">
				<Head.Title text="افزودن گروه" />
			</Head.Root>

			<form
				className="space-y-10"
				onSubmit={handleSubmit(async (values) => {
					setFormSuccessful(false);

					try {
						const duplicateGroupByName = await getGroupByName(
							UserGroupType.Group,
							values.name,
						);

						if (duplicateGroupByName) {
							setError("name", { message: "کلیدواژه مورد نظر تکراری است." });
							return;
						}

						const createdGroup = await createGroup({
							...values,
							type: UserGroupType.Group,
							metadata: {
								branchId:
									identity.branchId === null
										? values.branch?.id || null
										: identity.branchId,
							},
						});

						onGroupAdd(createdGroup);

						setFormSuccessful(true);
					} catch (err: any) {
						setError("root.server", {
							message: err?.message || "Something went wrong...",
						});
					}
				})}
			>
				{!isSubmitting && isFormSuccessful && (
					<Alert variant="info">
						<AlertDescription>
							گروه مورد نظر با موفقیت افزوده شد.
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
						<label className="shrink-0 basis-28 py-2" htmlFor="title">
							عنوان:
						</label>
						<div className="grow">
							<Input
								id="title"
								{...register("title", {
									required: messages.validation.required,
								})}
							/>
							<FieldError error={errors["title"]} />
						</div>
					</div>

					<div className="flex gap-x-2">
						<label className="shrink-0 basis-28 py-2" htmlFor="name">
							کلیدواژه:
						</label>
						<div className="grow">
							<Controller
								name="name"
								control={control}
								render={({ field: { value, onBlur, onChange } }) => (
									<MaskInput
										className="text-right"
										dir="ltr"
										id="name"
										mask={/^[a-zA-Z0-9-]+$/}
										value={value}
										onBlur={onBlur}
										onMutate={onChange}
									/>
								)}
								rules={{ required: messages.validation.required }}
							/>
							<FieldError error={errors["name"]} />
						</div>
					</div>

					{identity.branchId === null && (
						<div className="flex gap-x-2">
							<label className="shrink-0 basis-28 py-2" htmlFor="branch">
								شعبه:
							</label>
							<div className="grow">
								<Controller
									name="branch"
									control={control}
									render={({ field: { value, onBlur, onChange } }) => (
										<Select<Branch>
											defaultText="مرکزی"
											id="branch"
											items={branches.map((x) => ({
												label: x.title,
												value: x,
											}))}
											optional
											value={value || undefined}
											onCompare={compareById}
											onLeave={onBlur}
											onMutate={onChange}
										/>
									)}
								/>
								<FieldError error={errors["branch"]} />
							</div>
						</div>
					)}
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
