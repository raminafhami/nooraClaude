"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaPencilAlt } from "react-icons/fa";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/form/FieldError";
import { Input } from "@/form/Input";
import { MaskInput } from "@/form/MaskInput";
import { MobileNoInput } from "@/form/MobileNoInput";
import getUserById from "@/identity/users/services/getUserById";
import updateUser from "@/identity/users/services/updateUser";
import { messages } from "@/messages";
import { Head } from "@/ui/Head";
import { Loading } from "@/ui/Loader";
import { getDynamicUrl } from "@/utils/url/getDynamicUrl";

interface Props {
	id: string;
}

interface UserInformation {
	id: string;
	username: string | null;
	firstname: string;
	lastname: string;
	nationalCode: string | null;
	phoneNo: string | null;
	email: string | null;
}

type Mode = "display" | "edit";

export function UserInformation({ id }: Props) {
	const router = useRouter();

	const [isLoading, setLoading] = useState<boolean>(true);
	const [mode, setMode] = useState<Mode>("display");
	const [user, setUser] = useState<UserInformation>();

	useEffect(() => {
		fetchUser();
	}, []);

	async function fetchUser(): Promise<void> {
		try {
			const user = await getUserById(id);
			handleUserUpdate(user);
		} catch (err) {
			router.replace(getDynamicUrl("/dashboard/admin/users"));
		} finally {
			setLoading(false);
		}
	}

	function handleUserUpdate(data: UserInformation): void {
		setUser({
			id: data.id,
			username: data.username,
			firstname: data.firstname,
			lastname: data.lastname,
			nationalCode: data.nationalCode,
			phoneNo: data.phoneNo,
			email: data.email,
		});
	}

	function handleModeChange(mode: Mode): void {
		setMode(mode);
	}

	if (isLoading) {
		return <Loading size="sm">در حال دریافت اطلاعات...</Loading>;
	}

	if (!user) {
		return <></>;
	}

	return (
		<>
			<div className="space-y-6">
				<Head.Root>
					<Head.Title>اطلاعات کاربر</Head.Title>
				</Head.Root>

				<div>
					{(() => {
						switch (mode) {
							case "display":
								return (
									<UserInformationDisplay
										user={user}
										onModeChange={handleModeChange}
									/>
								);
							case "edit":
								return (
									<UserInformationForm
										user={user}
										onModeChange={handleModeChange}
										onUserUpdate={handleUserUpdate}
									/>
								);
						}
					})()}
				</div>
			</div>
		</>
	);
}

function UserInformationDisplay({
	user,
	onModeChange,
}: {
	user: UserInformation;
	onModeChange: (mode: Mode) => void;
}) {
	return (
		<div className="space-y-12">
			<div className="grid grid-cols-8 gap-x-6 gap-y-6">
				<div className="col-start-1">نام کاربری:</div>
				<div className="col-span-3">{user.username}</div>

				<div className="col-start-1">نام:</div>
				<div className="col-span-3">{`${user.firstname} ${user.lastname}`}</div>

				<div className="col-start-1">کد ملی:</div>
				<div className="col-span-3">{user.nationalCode || "-"}</div>

				<div className="col-start-1">شماره همراه:</div>
				<div className="col-span-3">{user.phoneNo}</div>

				<div className="col-start-1">پست الکترونیک:</div>
				<div className="col-span-3">{user.email || "-"}</div>
			</div>

			<Button
				className="flex items-center gap-x-2 px-3"
				size="sm"
				type="button"
				onClick={() => {
					onModeChange("edit");
				}}
			>
				<FaPencilAlt />
				<span>ویرایش</span>
			</Button>
		</div>
	);
}

function UserInformationForm({
	user,
	onModeChange,
	onUserUpdate,
}: {
	user: UserInformation;
	onModeChange: (mode: Mode) => void;
	onUserUpdate: (data: UserInformation) => void;
}) {
	const {
		formState,
		handleSubmit,
		register,
		reset,
		setError,
		setValue,
		watch,
	} = useForm<Omit<UserInformation, "id">>({
		defaultValues: (({ id, ...user }) => user)(user),
		mode: "onTouched",
	});
	const { errors, isDirty, isSubmitting, isSubmitSuccessful, isValid } =
		formState;
	const fields = watch();

	return (
		<>
			<form
				className="w-1/2 min-w-[40rem] space-y-6"
				onSubmit={handleSubmit(async (data) => {
					try {
						const updatedUser = await updateUser(user.id, data);

						onUserUpdate(
							(({ groups, metadata, ...user }) => user)(updatedUser),
						);

						reset(undefined, { keepDirty: false, keepDirtyValues: true });
					} catch (err) {
						setError("root.server", { message: "Something went wrong..." });
					}
				})}
			>
				{isSubmitSuccessful && (
					<Alert variant="info">
						<AlertDescription>
							اطلاعات کاربر با موفقیت بروزرسانی شد.
						</AlertDescription>
					</Alert>
				)}

				<div className="grid grid-cols-4 gap-x-6 gap-y-4">
					<div className="col-span-2 col-start-1 flex">
						<label
							className="shrink-0 basis-32 place-self-start pt-2.5"
							htmlFor="firstname"
						>
							نام:
						</label>
						<div className="grow">
							<Input
								id="firstname"
								{...register("firstname", {
									required: {
										message: messages.validation.required,
										value: true,
									},
								})}
							/>
							<FieldError error={errors["firstname"]} />
						</div>
					</div>

					<div className="col-span-2 col-start-1 flex">
						<label
							className="shrink-0 basis-32 place-self-start pt-2.5"
							htmlFor="lastname"
						>
							نام خانوادگی:
						</label>
						<div className="grow">
							<Input
								id="lastname"
								{...register("lastname", {
									required: {
										message: messages.validation.required,
										value: true,
									},
								})}
							/>
							<FieldError error={errors["lastname"]} />
						</div>
					</div>

					<div className="col-span-2 col-start-1 flex">
						<label
							className="shrink-0 basis-32 place-self-start pt-2.5"
							htmlFor="nationalCode"
						>
							کد ملی:
						</label>
						<div className="grow">
							<MaskInput
								id="nationalCode"
								mask="0000000000"
								value={fields["nationalCode"] || ""}
								onMutate={(v) => {
									setValue("nationalCode", v, {
										shouldDirty: true,
										shouldTouch: true,
										shouldValidate: true,
									});
								}}
								{...register("nationalCode")}
							/>
							<FieldError error={errors["nationalCode"]} />
						</div>
					</div>

					<div className="col-span-2 col-start-1 flex">
						<label
							className="shrink-0 basis-32 place-self-start pt-2.5"
							htmlFor="phoneNo"
						>
							شماره همراه:
						</label>
						<div className="grow">
							<MobileNoInput
								id="phoneNo"
								value={fields["phoneNo"] || ""}
								onMutate={(v) => {
									setValue("phoneNo", v, {
										shouldDirty: true,
										shouldTouch: true,
										shouldValidate: true,
									});
								}}
								{...register("phoneNo", {
									required: {
										message: messages.validation.required,
										value: true,
									},
								})}
							/>
							<FieldError error={errors["phoneNo"]} />
						</div>
					</div>

					<div className="col-span-2 col-start-1 flex">
						<label
							className="shrink-0 basis-32 place-self-start pt-2.5"
							htmlFor="email"
						>
							پست الکترونیک:
						</label>
						<Input id="email" {...register("email")} />
					</div>
				</div>

				<div className="mt-12">
					<Button
						className="w-36"
						disabled={!isDirty || isSubmitting || !isValid}
						size="sm"
					>
						{isSubmitting ? (
							<Loading horizontalPlacement="center" intent="white" size="sm">
								در حال ارسال...
							</Loading>
						) : isSubmitSuccessful && !isDirty ? (
							"بروزرسانی شد!"
						) : (
							"بروزرسانی"
						)}
					</Button>
				</div>
			</form>
		</>
	);
}
