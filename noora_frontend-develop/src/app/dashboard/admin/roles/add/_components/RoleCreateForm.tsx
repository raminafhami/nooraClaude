"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FieldError } from "@/form/FieldError";
import { Input } from "@/form/Input";
import { Select } from "@/form/select";
import { useRoles } from "@/identity/groups/hooks/useRoles";
import { UserGroupType } from "@/identity/groups/models/GroupType";
import { createGroup } from "@/identity/groups/services/createGroup";
import { setGroupPermissions } from "@/identity/groups/services/setGroupPermissions";
import { messages } from "@/messages";
import { Loading } from "@/ui/Loader";
import { getDynamicUrl } from "@/utils/url/getDynamicUrl";

import { RolePermissionsField } from "../../_components/RolePermissionsField";

interface FormData {
	name: string;
	title: string;
	parent: string | undefined;
}

export function RoleCreateForm() {
	const router = useRouter();

	const { groups: roles } = useRoles();
	const [permissions, setPermissions] = useState<string[]>([]);

	const {
		formState,
		handleSubmit,
		register,
		setError,
		setValue,
		trigger,
		watch,
	} = useForm<FormData>({
		mode: "onTouched",
	});
	const { errors, isSubmitting, isSubmitSuccessful } = formState;
	const fields = watch();

	useEffect(() => {
		register("parent");

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<form
				onSubmit={handleSubmit(async (data) => {
					try {
						const role = await createGroup({
							type: UserGroupType.Role,
							metadata: {},
							...data,
						});

						if (permissions.length) {
							await setGroupPermissions(role.id, permissions);
						}

						router.push(getDynamicUrl(`/dashboard/admin/roles/${role.id}`));
					} catch (err) {
						setError("root.server", { message: "Something went wrong..." });
					}
				})}
			>
				<div className="grid grid-cols-12 gap-x-10 gap-y-6">
					<div className="col-span-3 col-start-1">
						<label htmlFor="title">عنوان:</label>
						<Input
							className="mt-2"
							id="title"
							{...register("title", {
								required: {
									message: messages.validation.required,
									value: true,
								},
							})}
						/>
						<FieldError error={errors["title"]} />
					</div>

					<div className="col-span-3 col-start-1">
						<label htmlFor="name">نام:</label>
						<Input
							className="mt-2"
							id="name"
							{...register("name", {
								required: {
									message: messages.validation.required,
									value: true,
								},
							})}
						/>
						<FieldError error={errors["name"]} />
					</div>

					<div className="col-span-3 col-start-1">
						<label htmlFor="parent">والد:</label>
						<div className="mt-2">
							<Select
								id="parent"
								items={roles?.map((x) => {
									return { label: x.title, value: x.id };
								})}
								optional
								value={fields["parent"]}
								onLeave={() => {
									trigger("parent");
								}}
								onMutate={(v) => {
									setValue("parent", v, {
										shouldDirty: true,
										shouldTouch: true,
										shouldValidate: true,
									});
								}}
							/>
						</div>
						<FieldError error={errors["parent"]} />
					</div>

					<div className="col-span-full col-start-1">
						<label>دسترسی‌ها:</label>
						<div className="mt-2">
							<RolePermissionsField
								value={permissions}
								onChange={setPermissions}
							/>
						</div>
					</div>
				</div>

				<div className="mt-12">
					<Button
						disabled={isSubmitting || isSubmitSuccessful}
						variant="primary"
					>
						<span>افزودن</span>
						{isSubmitting && <Loading intent="white" size="xs" />}
					</Button>
				</div>
			</form>
		</>
	);
}
