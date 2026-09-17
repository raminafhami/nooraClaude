"use client";

import moment from "jalali-moment";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Button } from "@/components/ui/button";
import { Conditional } from "@/components/ui/conditional";
import { DateInput } from "@/components/ui/date-input";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
	CourseStatus,
	courseStatusOptions,
} from "@/courses/enums/CourseStatus";
import { Course } from "@/courses/models/Course";
import { createCourse } from "@/courses/services/createCourse";
import { updateCourse } from "@/courses/services/updateCourse";
import { messages } from "@/messages";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
	title: z.string().min(1, messages.validation.required),
	instructor: z.string().min(1, messages.validation.required),
	startDate: z.string().min(1, messages.validation.required),
	endDate: z.string().min(1, messages.validation.required),
	time: z.string().min(1, messages.validation.required),
	place: z.string().min(1, messages.validation.required),
	status: z.custom<CourseStatus>(Boolean, messages.validation.required),
});

type FormData = z.infer<typeof schema>;

function CourseUpsertDialog({
	open,
	payload,
	onClose,
	onUnmount,
}: {
	open: boolean;
	payload?: Course;
	onClose: (result?: Course) => void;
	onUnmount?: () => void;
}) {
	return (
		<Dialog open={open} onOpenChange={() => onClose()}>
			<Conditional mount={open} delay onUnmount={onUnmount}>
				<CourseUpsertForm course={payload} onClose={onClose} />
			</Conditional>
		</Dialog>
	);
}

function CourseUpsertForm({
	course,
	onClose,
}: {
	course?: Course;
	onClose: (result?: Course) => void;
}) {
	const form = useForm<FormData>({
		defaultValues: {
			title: course?.title ?? "",
			instructor: course?.instructor ?? "",
			startDate: course?.startDate
				? moment(course.startDate).format("jYYYY/jMM/jDD")
				: "",
			endDate: course?.endDate
				? moment(course.endDate).format("jYYYY/jMM/jDD")
				: "",
			time: course?.time ?? "",
			place: course?.place ?? "",
			status: course?.status,
		},
		resolver: zodResolver(schema),
	});

	const {
		control,
		formState: { errors, isDirty, isSubmitting, isSubmitSuccessful },
		handleSubmit: handleRhfSubmit,
		setError,
	} = form;

	async function handleSubmit(values: FormData) {
		try {
			let upsertedCourse: Course;

			const startDate = moment(values.startDate, "jYYYY/jMM/jDD").toDate();
			const endDate = moment(values.endDate, "jYYYY/jMM/jDD").toDate();

			if (course?.id) {
				upsertedCourse = await updateCourse(course.id, {
					title: values.title,
					instructor: values.instructor,
					startDate,
					endDate,
					time: values.time,
					place: values.place,
					status: values.status,
				});
			} else {
				upsertedCourse = await createCourse({
					title: values.title,
					instructor: values.instructor,
					startDate,
					endDate,
					time: values.time,
					place: values.place,
					status: values.status,
				});
			}

			onClose(upsertedCourse);
		} catch (err) {
			console.error(err);
			setError("root.server", {
				message: "خطای نامشخصی در هنگام ثبت اطلاعات رخ داد.",
			});
		}
	}

	return (
		<DialogContent
			className="max-w-screen-md"
			onInteractOutside={(event) => {
				if (isDirty) {
					event.preventDefault();
				}
			}}
		>
			<DialogHeader>
				<DialogTitle>
					{course ? "ویرایش دوره آموزشی" : "ایجاد دوره آموزشی"}
				</DialogTitle>
			</DialogHeader>

			<Form {...form}>
				<form
					onSubmit={async (e) => {
						e.stopPropagation();
						await handleRhfSubmit(handleSubmit)(e);
					}}
				>
					<fieldset
						className="space-y-8"
						disabled={isSubmitting || isSubmitSuccessful}
					>
						<div className="grid grid-cols-12 gap-6">
							<FormField
								control={control}
								name="title"
								render={({ field }) => (
									<FormItem className="col-span-full">
										<FormLabel>عنوان:</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={control}
								name="instructor"
								render={({ field }) => (
									<FormItem className="col-span-full !col-start-1 sm:col-span-6">
										<FormLabel>مدرس:</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={control}
								name="startDate"
								render={({ field }) => (
									<FormItem className="col-span-full !col-start-1 sm:col-span-6">
										<FormLabel>تاریخ شروع:</FormLabel>
										<FormControl>
											<DateInput {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={control}
								name="endDate"
								render={({ field }) => (
									<FormItem className="col-span-full col-start-1 sm:col-span-6">
										<FormLabel>تاریخ پایان:</FormLabel>
										<FormControl>
											<DateInput {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={control}
								name="time"
								render={({ field }) => (
									<FormItem className="col-span-full !col-start-1 sm:col-span-6">
										<FormLabel>زمان:</FormLabel>
										<FormControl>
											<Input
												className="text-right tracking-widest"
												dir="ltr"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={control}
								name="place"
								render={({ field }) => (
									<FormItem className="col-span-full col-start-1 sm:col-span-6">
										<FormLabel>مکان:</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={control}
								name="status"
								render={({ field }) => (
									<FormItem className="col-span-full !col-start-1 sm:col-span-6">
										<FormLabel>وضعیت:</FormLabel>
										<FormControl>
											<Select
												value={field.value ?? ""}
												onValueChange={field.onChange}
											>
												<SelectTrigger ref={field.ref}>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{courseStatusOptions.map((x) => (
														<SelectItem key={x.value} value={x.value}>
															{x.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{errors.root?.server && (
							<DestructiveAlert>
								<AlertDescription>
									{errors.root.server.message}
								</AlertDescription>
							</DestructiveAlert>
						)}

						<div className="flex flex-col gap-3 xs:flex-row-reverse">
							<Button className="min-w-24" variant="primary">
								<Spinner color="white" loading={isSubmitting} size="sm">
									{course?.id ? "بروزرسانی" : "افزودن"}
								</Spinner>
							</Button>

							<Button type="button" variant="ghost" onClick={() => onClose()}>
								بازگشت
							</Button>
						</div>
					</fieldset>
				</form>
			</Form>
		</DialogContent>
	);
}

export { CourseUpsertDialog };
