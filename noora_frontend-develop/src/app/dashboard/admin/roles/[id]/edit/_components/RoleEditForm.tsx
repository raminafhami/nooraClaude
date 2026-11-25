"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FieldError } from "@/form/FieldError";
import { Input } from "@/form/Input";
import { Select } from "@/form/select";
import { useRoles } from "@/identity/groups/hooks/useRoles";
import { getGroupById } from "@/identity/groups/services/getGroupById";
import { updateGroup } from "@/identity/groups/services/updateGroup";
import { messages } from "@/messages";
import { Loading } from "@/ui/Loader";
import { getDynamicUrl } from "@/utils/url/getDynamicUrl";

import { RolePermissionsField } from "../../../_components/RolePermissionsField";

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
	const [permissions, setPermissions] = useState<string[]>([]);
	const [permissionsReady, setPermissionsReady] = useState(false);
	const [loadError, setLoadError] = useState(false);
	const [loaded, setLoaded] = useState(false);

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
		let active = true;
		setLoaded(false);
		setLoadError(false);
		setPermissionsReady(false);
		(async () => {
			try {
				const role = await getGroupById(id);
				if (!active) return;
				reset({
					title: role.title,
					name: role.name,
					parent: typeof role.parent === "string" ? role.parent : role.parent?.id,
				});
				setPermissions((role.permissions ?? []).map((permission) =>
					typeof permission === "string" ? permission : permission.id,
				));
				setLoaded(true);
			} catch {
				if (active) setLoadError(true);
			}
		})();
		return () => { active = false; };
	}, [id, reset]);

	useEffect(() => {
		register("parent");

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (loadError) return <p role="alert">دریافت اطلاعات نقش انجام نشد.</p>;
	if (!loaded) return <Loading size="sm">در حال دریافت اطلاعات نقش...</Loading>;

	return (
		<>
			<form
				onSubmit={handleSubmit(async (data) => {
					try {
						await updateGroup(id, {
							...data,
							parent: data.parent ?? null,
							permissions,
						});

						router.push(getDynamicUrl(`/dashboard/admin/roles/${id}`));
					} catch (error: any) {
						setError("root.server", {
							message: typeof error?.message === "string" ? error.message : "ویرایش نقش انجام نشد.",
						});
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

					<div className="col-span-full col-start-1">
						<label>دسترسی‌ها:</label>
						<div className="mt-2">
							<RolePermissionsField
								value={permissions}
								onChange={setPermissions}
								onReady={setPermissionsReady}
							/>
						</div>
					</div>
				</div>

				<div className="mt-12">
					{errors.root?.server && <p role="alert" className="mb-3 text-sm text-red-700">{errors.root.server.message}</p>}
					<Button
						disabled={!permissionsReady || isSubmitting || isSubmitSuccessful}
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
