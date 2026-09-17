"use client";

import { memo, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Branch } from "@/branches/models/Branch";
import { createBranch } from "@/branches/services/createBranch";
import { updateBranch } from "@/branches/services/updateBranch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/form/FieldError";
import { Input } from "@/form/Input";
import { messages } from "@/messages";
import { Head } from "@/ui/Head";
import { Loading } from "@/ui/Loader";

interface Props {
	branch: Branch | null;
	onBranchAdd: (branch: Branch) => void;
	onBranchUpdate: (branch: Partial<Branch>) => void;
	onCancel: () => void;
}

interface FormData {
	id: string;
	name: string;
	title: string;
}

export const BranchInfoForm = memo(function BranchInfoForm({
	branch,
	onBranchAdd,
	onBranchUpdate,
	onCancel,
}: Props): React.ReactNode {
	const [isFormSuccessful, setFormSuccessful] = useState<boolean>(false);

	const { formState, handleSubmit, register, reset, setError } =
		useForm<FormData>({ mode: "onTouched" });
	const { errors, isDirty, isSubmitting, isSubmitSuccessful } = formState;

	useEffect(() => {
		setFormSuccessful(false);
	}, [branch?.id]);

	useEffect(() => {
		reset({ name: branch?.name || "", title: branch?.title || "" });
	}, [branch, isSubmitSuccessful, reset]);

	return (
		<div className="space-y-8">
			<Head.Root>
				<Head.Title>
					{branch ? `ویرایش شعبه: ${branch.title}` : "افزودن شعبه"}
				</Head.Title>
			</Head.Root>

			<form
				onSubmit={handleSubmit(async (values) => {
					setFormSuccessful(false);

					const name = values.name.trim();
					const title = values.title.trim();

					try {
						if (branch) {
							const updatedBranch = await updateBranch(branch.id, {
								name,
								title,
							});
							onBranchUpdate(updatedBranch);
						} else {
							const createdBranch = await createBranch({ name, title });
							onBranchAdd(createdBranch);
						}

						setFormSuccessful(true);
					} catch (err: any) {
						console.error(err);
						setError("root.server", {
							message: err?.message || "Something went wrong...",
						});
					}
				})}
			>
				<div className="space-y-4">
					{isFormSuccessful && (
						<Alert className="col-span-2 col-start-1 mb-4" variant="info">
							<AlertDescription>
								{branch
									? "شعبه مورد نظر با موفقیت بروزرسانی گردید."
									: "شعبه مورد نظر با موفقیت افزوده شد."}
							</AlertDescription>
						</Alert>
					)}

					<div className="flex gap-x-4">
						<label className="shrink-0 basis-24 pt-2" htmlFor="title">
							نام:
						</label>
						<div className="grow">
							<Input
								autoComplete="off"
								id="title"
								{...register("title", {
									required: messages.validation.required,
								})}
							/>
							<FieldError error={errors["title"]} />
						</div>
					</div>

					<div className="flex gap-x-4">
						<label className="shrink-0 basis-24 pt-2" htmlFor="name">
							کلیدواژه:
						</label>
						<div className="grow">
							<Input
								autoComplete="off"
								className="text-right"
								dir="ltr"
								id="name"
								{...register("name", {
									required: messages.validation.required,
								})}
							/>
							<FieldError error={errors["name"]} />
						</div>
					</div>

					<div className="ms-28 flex gap-x-2">
						<Button className="w-24" disabled={!isDirty || isSubmitting}>
							{isSubmitting ? (
								<Loading
									horizontalPlacement="center"
									intent="white"
									size="sm"
								/>
							) : branch ? (
								"بروزرسانی"
							) : (
								"افزودن"
							)}
						</Button>

						{branch && (
							<Button
								disabled={isSubmitting}
								variant="ghost"
								onClick={() => onCancel()}
							>
								انصراف
							</Button>
						)}
					</div>
				</div>
			</form>
		</div>
	);
});
