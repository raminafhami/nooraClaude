"use client";

import { memo } from "react";
import { Controller, useForm } from "react-hook-form";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/form/FieldError";
import { Input } from "@/form/Input";
import { MaskInput } from "@/form/MaskInput";
import { UserGroupType } from "@/identity/groups/models/GroupType";
import { getGroupByName } from "@/identity/groups/services/getGroupByName";
import { updateGroup } from "@/identity/groups/services/updateGroup";
import { messages } from "@/messages";
import { Loading } from "@/ui/Loader";

import { useGroupContext } from "../GroupContext";

interface Props {
	onInformationEditCancel: () => void;
}

interface FormData {
	title: string;
	name: string;
}

export const InformationEditForm = memo(function InformationEditForm({
	onInformationEditCancel,
}: Props): React.ReactNode {
	const { group, onGroupUpdate } = useGroupContext();

	const { control, formState, handleSubmit, register, reset, setError } =
		useForm<FormData>({
			defaultValues: { title: group.title, name: group.name },
			mode: "onTouched",
		});
	const { errors, isDirty, isSubmitting, isSubmitSuccessful } = formState;

	return (
		<div className="grid grid-cols-4">
			<form
				className="space-y-10"
				onSubmit={handleSubmit(async (values) => {
					try {
						const duplicateGroupByName = await getGroupByName(
							UserGroupType.Group,
							values.name,
						);

						if (duplicateGroupByName && group.id !== duplicateGroupByName.id) {
							setError("name", { message: "کلیدواژه مورد نظر تکراری است." });
							return;
						}

						const updatedGroup = await updateGroup(group.id, {
							...values,
						});

						onGroupUpdate({ ...updatedGroup });

						reset({
							...values,
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
							اطلاعات گروه مورد نظر با موفقیت بروزرسانی گردید.
						</AlertDescription>
					</Alert>
				)}

				{errors.root?.server && (
					<DestructiveAlert>
						<AlertDescription>{errors.root.server.message}</AlertDescription>
					</DestructiveAlert>
				)}

				<div className="grid grid-cols-1 gap-y-4">
					<div className="flex items-center gap-x-2">
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

					<div className="flex items-center gap-x-2">
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
				</div>

				<div className="ms-28 flex gap-x-3 ps-2">
					<Button className="min-w-[6rem]" disabled={isSubmitting || !isDirty}>
						{isSubmitting ? (
							<Loading horizontalPlacement="center" intent="white" size="xs" />
						) : (
							"بروزرسانی"
						)}
					</Button>

					<Button
						variant="ghost"
						type="button"
						onClick={() => onInformationEditCancel()}
					>
						انصراف
					</Button>
				</div>
			</form>
		</div>
	);
});
