"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaCheck } from "react-icons/fa";
import { IoIosNotifications } from "react-icons/io";
import { MdRefresh } from "react-icons/md";
import ReactSelect from "react-select";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { FieldError } from "@/form/FieldError";
import { Input } from "@/form/Input";
import { Select } from "@/form/select";
import { Textarea } from "@/form/textarea";
import { UserGroupType } from "@/identity/groups/models/GroupType";
import { getGroups } from "@/identity/groups/services/getGroups";
import { getUsers } from "@/identity/users/services/getUsers";
import { messages } from "@/messages";
import { NotificationsPriority } from "@/notifications/models/NotificationsPriority";
import PostNotifications from "@/notifications/services/postNotification";
import { Loading } from "@/ui/Loader";
import { ReactSelectStyle } from "@/ui/Select/ReactSelectStyle";

interface FormData {
	title: string;
	description: string;
	priority: string;
	recipient: { value: string; label: string }[];
	users: { value: string; label: string }[];
	groups: { value: string; label: string }[];
	category: string;
}
interface SelectProp {
	value: string;
	label: string;
}

//   control: (provided, state) => ({
//     ...provided,
//     borderRadius: "12px",
//     boxShadow: "none !important",
//     borderColor: "E5E7EB",
//     ":hover": {
//       borderColor: "#E5E7EB",
//     },

//     ":focus-within": {
//       borderColor: "#cccccc",
//     },
//   }),
//   indicatorSeparator: () => ({
//     display: "none",
//   }),
//   option: (styles, { data, isDisabled, isFocused, isSelected }) => ({
//     ...styles,
//     backgroundColor: "transparent",
//     color: "#000",
//     ":hover": {
//       backgroundColor: "#20418C1F",
//       color: "#20418e",
//     },
//     ":active": {
//       ...styles[":active"],
//       backgroundColor: "transparent",
//     },
//   }),
//   menu: (provided) => ({
//     ...provided,
//     borderRadius: "12px",
//   }),
//   multiValue: (provided) => ({
//     ...provided,
//     borderRadius: "6px",
//     padding: "2px",
//   }),
//   multiValueLabel: (provided) => ({
//     ...provided,
//     fontWeight: "bold",
//   }),
//   multiValueRemove: (provided) => ({
//     ...provided,
//     color: "#900000",
//     fontWeight: "bold",
//     ":hover": {
//       backgroundColor: "#800000",
//       color: "white",
//     },
//   }),
// };

const priorities = [
	{ value: "high", label: "بالا" },
	{ value: "medium", label: "متوسط" },
	{ value: "low", label: "پایین" },
];
const recipients = [
	{ value: "groups", label: "گروه‌ها" },
	{ value: "users", label: "کاربران" },
];
const categories = [
	// { value: "پیام جدید", label: "پیام جدید" },
	{ value: "بازرسی", label: "بازرسی" },
	{ value: "مالی", label: "مالی" },
];
export function AddNotification() {
	const [loading, setLoading] = useState<boolean>(true);
	const [serviceStatus, setServiceStatus] = useState<boolean>(true);
	const [users, setUsers] = useState<SelectProp[]>();
	const [groups, setGroups] = useState<SelectProp[]>();
	const [isDisabled, setIsDisabled] = useState(false);

	const {
		formState,
		handleSubmit,
		register,
		setError,
		setValue,
		trigger,
		watch,
	} = useForm<FormData>({
		defaultValues: {
			recipient: [],
			groups: [],
			users: [],
			priority: "",
			description: "",
			title: "",
			category: "",
		},
		mode: "onTouched",
	});
	const { errors, isSubmitting, isSubmitSuccessful } = formState;
	const fields = watch();

	useEffect(() => {
		getData();
	}, []);

	async function getData() {
		setLoading(true);
		try {
			await getUsers().then((res) => {
				const users = res.map((user) => {
					return { value: user.id, label: user.fullname };
				});
				setUsers(users);
			});

			await getGroups(UserGroupType.Group).then((res) => {
				const groups = res.map((group) => {
					return { value: group.id, label: group.title };
				});
				setGroups(groups);
			});
		} catch (error) {
			toast.error("مشکلی پیش آمده!");
			setServiceStatus(false);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		register("users", {
			required:
				fields.recipient.some((recipient) => recipient.value === "users") &&
				messages.validation.required,
		});
		register("groups", {
			required:
				fields.recipient.some((recipient) => recipient.value === "groups") &&
				messages.validation.required,
		});
		register("recipient", {
			required: messages.validation.required,
		});
	}, [fields.recipient, register]);

	// console.log(fields);
	// console.log(formState.errors);

	useEffect(() => {
		if (isDisabled) {
			setTimeout(() => {
				setIsDisabled(false);
			}, 10000);
		}
	}, [isDisabled]);

	async function onSubmit() {
		try {
			let res = await PostNotifications({
				title: fields.title,
				description: fields.description,
				category: fields.category,
				groups: fields.groups.flatMap((group) => group.value),
				users: fields.users.flatMap((user) => user.value),
				priority: fields.priority as NotificationsPriority,
				sendNotification: true,
			});
			if (res) {
				setIsDisabled(true);
			}
		} catch (err) {
			toast.error("مشکلی پیش آمده، مجدد تلاش کنید");
		}
	}

	return (
		<>
			{loading ? (
				<Loading className="flex items-center justify-center" size={"md"}>
					درحال دریافت اطلاعات
				</Loading>
			) : !serviceStatus ? (
				<div className="flex flex-col items-center justify-center gap-2">
					<div className="text-red-800">مشکلی در دریافت اطلاعات پیش آمده!</div>
					<div
						className="flex cursor-pointer items-center gap-1"
						onClick={getData}
					>
						<span>تلاش مجدد</span>
						<MdRefresh size={16} />
					</div>
				</div>
			) : (
				<form onSubmit={handleSubmit(onSubmit)}>
					<div className="grid grid-cols-1 gap-y-6 sm:grid-cols-4 sm:gap-x-10 xl:grid-cols-6">
						<div className="col-span-full sm:col-span-2">
							<label htmlFor="priority" className="inline-block pb-2">
								اولویت:
							</label>
							<Select
								id="priority"
								items={priorities}
								value={fields.priority}
								onMutate={(v) => {
									setValue("priority", v || "", {
										shouldDirty: true,
										shouldTouch: true,
										shouldValidate: true,
									});
								}}
								{...(({ ref, ...register }) => register)(
									register("priority", {
										required: messages.validation.required,
									}),
								)}
							/>
							<FieldError error={errors["priority"]} />
						</div>

						<div className="col-span-full sm:col-span-2">
							<label htmlFor="recipient" className="inline-block pb-2">
								ارسال به:
							</label>
							<ReactSelect
								isMulti
								isClearable={false}
								name="recipient"
								placeholder="انتخاب کنید"
								styles={ReactSelectStyle}
								options={recipients}
								className="basic-multi-select"
								classNamePrefix="select"
								noOptionsMessage={() => "هیچ موردی یافت نشد"}
								value={
									fields.recipient !== undefined && fields.recipient
										? fields.recipient
										: undefined
								}
								onChange={(selectedOptions) => {
									setValue("recipient", selectedOptions as SelectProp[], {
										shouldDirty: true,
										shouldTouch: true,
										shouldValidate: true,
									});
								}}
							/>
							<FieldError error={errors["recipient"]} />
						</div>

						{fields.recipient.some(
							(recipient) => recipient.value === "users",
						) && (
							<div className="col-span-4 sm:col-start-1">
								<label htmlFor="users" className="inline-block pb-2">
									انتخاب کاربران
								</label>
								<ReactSelect
									isMulti
									isClearable={false}
									name="users"
									placeholder="انتخاب کنید"
									styles={ReactSelectStyle}
									options={users}
									className="basic-multi-select"
									classNamePrefix="select"
									noOptionsMessage={() => "هیچ موردی یافت نشد"}
									value={
										fields.users !== undefined && fields.users
											? fields.users
											: undefined
									}
									onChange={(selectedOptions) => {
										setValue("users", selectedOptions as SelectProp[], {
											shouldDirty: true,
											shouldTouch: true,
											shouldValidate: true,
										});
									}}
								/>
								<FieldError error={errors["users"]} />
							</div>
						)}

						{fields.recipient.some(
							(recipient) => recipient.value === "groups",
						) && (
							<div className="col-span-4 sm:col-start-1">
								<label htmlFor="groups" className="inline-block pb-2">
									انتخاب گروه‌ها
								</label>
								<ReactSelect
									isMulti
									isClearable={false}
									name="groups"
									placeholder="انتخاب کنید"
									styles={ReactSelectStyle}
									options={groups}
									className="basic-multi-select"
									classNamePrefix="select"
									noOptionsMessage={() => "هیچ موردی یافت نشد"}
									value={
										fields.groups !== undefined && fields.groups
											? fields.groups
											: undefined
									}
									onChange={(selectedOptions) => {
										setValue("groups", selectedOptions as SelectProp[], {
											shouldDirty: true,
											shouldTouch: true,
											shouldValidate: true,
										});
									}}
								/>
								<FieldError error={errors["groups"]} />
							</div>
						)}

						<div className="col-span-full sm:col-span-2 sm:col-start-1">
							<label htmlFor="category" className="inline-block pb-2">
								دسته بندی:
							</label>
							<Select
								id="category"
								items={categories}
								value={fields.category}
								onMutate={(v) => {
									setValue("category", v || "", {
										shouldDirty: true,
										shouldTouch: true,
										shouldValidate: true,
									});
								}}
								{...(({ ref, ...register }) => register)(
									register("category", {
										required: messages.validation.required,
									}),
								)}
							/>
							<FieldError error={errors["category"]} />
						</div>

						<div className="col-span-full sm:col-span-2">
							<label htmlFor="title" className="inline-block pb-2">
								عنوان:
							</label>
							<Input
								id="title"
								value={fields.title?.replace(/^\s/, "").replace(/\s\s+/g, " ")}
								{...register("title", {
									required: messages.validation.required,
								})}
							/>
							<FieldError error={errors["title"]} />
						</div>

						<div className="col-span-full sm:col-span-4 sm:col-start-1">
							<label htmlFor="description" className="inline-block pb-2">
								توضیحات:
							</label>
							<Textarea
								className="!min-h-[5rem] p-2 focus:outline-none"
								maxLength={200}
								id="description"
								value={fields.description?.replace(/^\s/, "")}
								{...register("description", {
									required: messages.validation.required,
									validate: (v) =>
										v.length > 199 ? "حداکثر کاراکتر مجاز" : true,
								})}
							/>
							<FieldError error={errors["description"]} />
						</div>
					</div>

					<div className="mt-12">
						<Button
							className={`min-w-[10rem] ${
								isDisabled && "!bg-green-100 !text-green-900"
							}`}
							disabled={isSubmitting || isDisabled}
							type="submit"
							variant="primary"
						>
							{isSubmitting ? (
								<Loading size="sm">در حال ارسال اطلاعات...</Loading>
							) : isDisabled ? (
								<div className="flex items-center justify-center gap-3">
									<span>اعلان با موفقیت ارسال شد</span>
									<FaCheck size={16} className="text-green-900" />
								</div>
							) : (
								<div className="flex items-center justify-center gap-1">
									<span>ارسال اعلان</span>
								</div>
							)}
						</Button>
					</div>
				</form>
			)}
		</>
	);
}
