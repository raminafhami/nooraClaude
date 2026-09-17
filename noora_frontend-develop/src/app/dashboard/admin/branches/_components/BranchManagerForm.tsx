"use client";

import { memo, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { Branch } from "@/branches/models/Branch";
import { updateBranch } from "@/branches/services/updateBranch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/form/FieldError";
import { SelectDynamic } from "@/form/select";
import { User } from "@/identity/users/models/User";
import { UserType } from "@/identity/users/models/UserType";
import { getUsers } from "@/identity/users/services/getUsers";
import { Head } from "@/ui/Head";
import { Loading } from "@/ui/Loader";
import { compareById } from "@/utils";

interface Props {
	branch: Branch;
	onCancel: () => void;
	onManagerUpdate: (branchId: string, managerId: string | null) => void;
}

interface FormData {
	manager: User | null;
}

export const BranchManagerForm = memo(function BranchManagerForm({
	branch,
	onCancel,
	onManagerUpdate,
}: Props): React.ReactNode {
	const [isLoading, setLoading] = useState<boolean>(true);
	const [users, setUsers] = useState<User[]>([]);

	const { control, formState, handleSubmit, reset, setError } =
		useForm<FormData>({ mode: "onTouched" });
	const { isDirty, isSubmitting, isSubmitSuccessful } = formState;

	useEffect(() => {
		(async () => {
			if (!isSubmitSuccessful) {
				setLoading(true);

				try {
					const users = await getUsers({
						filters: {
							type: UserType.Personnel,
							branchId: branch.id,
						},
					});

					const data: Partial<FormData> = {};
					if (users.length !== 0 && branch.managerId) {
						data.manager = users.find((x) => x.id === branch.managerId);
					}

					setUsers(users);
					reset(data);
				} catch (err: any) {
					console.error(err.message);
				} finally {
					setLoading(false);
				}
			}
		})();
	}, [branch, isSubmitSuccessful, reset]);

	return (
		<div className="space-y-8">
			<Head.Root>
				<Head.Title>تعیین مدیر شعبه: {branch.title}</Head.Title>
			</Head.Root>

			<form
				onSubmit={handleSubmit(async (values) => {
					try {
						const updatedBranch = await updateBranch(branch.id, {
							managerId: values.manager?.id || null,
						});
						onManagerUpdate(updatedBranch.id, updatedBranch.managerId);
						reset({ ...values });
					} catch (err) {
						setError("root.server", { message: "Something went wrong..." });
					}
				})}
			>
				{isLoading ? (
					<Loading size="sm">در حال دریافت اطلاعات...</Loading>
				) : (
					<div className="space-y-4">
						{!isSubmitting && isSubmitSuccessful && (
							<Alert className="col-span-2 col-start-1 mb-4" variant="info">
								<AlertDescription>
									مدیر شعبه مورد نظر با موفقیت بروزرسانی گردید.
								</AlertDescription>
							</Alert>
						)}

						<div className="flex gap-x-4">
							<label className="shrink-0 basis-24 pt-2" htmlFor="manager">
								مدیر شعبه:
							</label>
							<div className="grow">
								<Controller
									control={control}
									name="manager"
									render={({
										field: { name, value, onBlur, onChange },
										fieldState: { error },
									}) => (
										<>
											<SelectDynamic<User>
												id={name}
												value={value || undefined}
												onCompare={compareById}
												onLabel={(x) => x.fullname}
												onLeave={onBlur}
												onMutate={(v) => onChange(v || null)}
												onSearch={(v) => {
													return v
														? users.filter((x) => x.fullname.includes(v))
														: users;
												}}
											/>
											<FieldError error={error} />
										</>
									)}
								/>
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
								) : (
									"بروزرسانی"
								)}
							</Button>

							<Button
								disabled={isSubmitting}
								variant="ghost"
								onClick={() => onCancel()}
							>
								انصراف
							</Button>
						</div>
					</div>
				)}
			</form>
		</div>
	);
});
