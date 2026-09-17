"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FieldError } from "@/form/FieldError";
import { Input } from "@/form/Input";
import { Select } from "@/form/select";
import { useRoles } from "@/identity/groups/hooks/useRoles";
import { UserGroup } from "@/identity/groups/models/Group";
import { getGroupById } from "@/identity/groups/services/getGroupById";
import { updateGroup } from "@/identity/groups/services/updateGroup";
import { messages } from "@/messages";
import { Loading } from "@/ui/Loader";
import { getDynamicUrl } from "@/utils/url/getDynamicUrl";

interface Props {
	id: string;
}

interface FormData {
	name: string;
	title: string;
	parent: string | undefined;
}

export function RoleEditForm({ id }: Props) {
	const router = useRouter();

	const { groups: roles } = useRoles();

	const {
		formState,
		handleSubmit,
		register,
		reset,
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
		(async () => {
			const role = await getGroupById(id);

			if (!role) {
				router.replace("/dashboard/admin/roles");
				return;
			}

			reset({
				title: role.title,
				name: role.name,
				parent: role.parent && (role.parent as UserGroup).id,
			});
		})();
	}, []);

	useEffect(() => {
		register("parent");

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<form
				onSubmit={handleSubmit(async (data) => {
					try {
						const role = await updateGroup(id, {
							...data,
							metadata: {},
						});
						router.push(getDynamicUrl(`/dashboard/admin/roles/${id}`));
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
								items={roles
									?.filter((x) => x.id !== id)
									.map((x) => {
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
				</div>

				<div className="mt-12">
					<Button
						disabled={isSubmitting || isSubmitSuccessful}
						variant="primary"
					>
						<span>ویرایش</span>
						{isSubmitting && <Loading intent="white" size="xs" />}
					</Button>
				</div>
			</form>
		</>
	);
}
