"use client";

import omit from "lodash/omit";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FieldError } from "@/form/FieldError";
import { Input } from "@/form/Input";
import { MaskInput } from "@/form/MaskInput";
import { MobileNoInput } from "@/form/MobileNoInput";
import { Select } from "@/form/select";
import { UserType } from "@/identity/users/models/UserType";
import createUser from "@/identity/users/services/createUser";
import { messages } from "@/messages";
import { Loading } from "@/ui/Loader";
import { getDynamicUrl } from "@/utils/url/getDynamicUrl";

interface FormData {
	type: UserType;
	firstname: string;
	lastname: string;
	nationalCode: string;
	phoneNo: string;
	email: string;
	username: string;
	password: string;
	passwordConfirm: string;
}

export function UserCreateForm() {
	const router = useRouter();

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
		register("type", {
			required: { message: messages.validation.required, value: true },
		});
	}, []);

	return (
		<>
			<form
				autoComplete="off"
				onSubmit={handleSubmit(async ({ firstname, ...data }) => {
					try {
						const user = await createUser({
							branchId: null,
							name: firstname,
							metadata: {},
							...omit(data, "passwordConfirm"),
						});

						router.push(getDynamicUrl(`/dashboard/admin/users/${user.id}`));
					} catch (err) {
						setError("root.server", { message: "Something went wrong..." });
					}
				})}
			>
				<div className="grid grid-cols-12 gap-x-10 gap-y-6">
					<div className="col-span-3 col-start-1">
						<label htmlFor="type">نوع کاربری:</label>
						<div className="mt-2">
							<Select<UserType>
								id="type"
								items={Object.keys(omit(UserType, "System")).map((x) => {
									const k = x as keyof typeof UserType;
									return { label: x, value: UserType[k] };
								})}
								value={fields["type"]}
								onLeave={() => {
									trigger("type");
								}}
								onMutate={(v) => {
									setValue("type", v!, {
										shouldDirty: true,
										shouldTouch: true,
										shouldValidate: true,
									});
								}}
							/>
						</div>
						<FieldError error={errors["type"]} />
					</div>

					<div className="col-span-full mt-5">
						<div className="h-1 bg-gray-100"></div>
					</div>

					<div className="col-span-3 col-start-1">
						<label htmlFor="firstname">نام:</label>
						<Input
							className="mt-2"
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

					<div className="col-span-3">
						<label htmlFor="lastname">نام خانوادگی:</label>
						<Input
							className="mt-2"
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

					<div className="col-span-3 col-start-1">
						<label htmlFor="nationalCode">کد ملی:</label>
						<MaskInput
							className="mt-2"
							id="nationalCode"
							mask="0000000000"
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

					<div className="col-span-3">
						<label htmlFor="phoneNo">شماره همراه:</label>
						<MobileNoInput
							autoComplete="new-password"
							className="mt-2"
							id="phoneNo"
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

					<div className="col-span-3">
						<label htmlFor="email">پست الکترونیک:</label>
						<Input
							autoComplete="new-password"
							className="mt-2"
							id="email"
							{...register("email")}
						/>
						<FieldError error={errors["email"]} />
					</div>

					<div className="col-span-full mt-5">
						<div className="h-1 bg-gray-100"></div>
					</div>

					<div className="col-span-3 col-start-1">
						<label htmlFor="username">نام کاربری:</label>
						<Input
							autoComplete="new-password"
							className="mt-2"
							id="username"
							{...register("username")}
						/>
						<FieldError error={errors["username"]} />
					</div>

					<div className="col-span-3 col-start-1">
						<label htmlFor="password">رمز عبور:</label>
						<Input
							autoComplete="new-password"
							className="mt-2 text-right tracking-wider"
							dir="ltr"
							id="password"
							type="password"
							{...register("password", {
								required: {
									message: messages.validation.required,
									value: true,
								},
							})}
						/>
						<FieldError error={errors["password"]} />
					</div>

					<div className="col-span-3">
						<label htmlFor="passwordConfirm">تکرار رمز عبور:</label>
						<Input
							autoComplete="new-password"
							className="mt-2 text-right tracking-wider"
							dir="ltr"
							id="passwordConfirm"
							type="password"
							{...register("passwordConfirm", {
								required: {
									message: messages.validation.required,
									value: true,
								},
								validate: (v, values) => {
									if (v && v !== values["password"]) {
										return "تکرار رمز عبور مطابقت ندارد.";
									}
								},
							})}
						/>
						<FieldError error={errors["passwordConfirm"]} />
					</div>
				</div>

				<div className="mt-12">
					<Button
						className="min-w-[10rem]"
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
