"use client";

import moment from "jalali-moment";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { DateInput } from "@/components/ui/date-input";
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
import {
	CourseStatus,
	courseStatusOptions,
} from "@/courses/enums/CourseStatus";
import { updateCourse } from "@/courses/services/updateCourse";
import { messages } from "@/messages";
import { Loading } from "@/ui/Loader";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCourseContext } from "../useCourseContext";

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

function CourseInfoForm({ onCancel }: { onCancel: () => void }) {
	const { course, handleCourseUpdate } = useCourseContext();

	const form = useForm<FormData>({
		defaultValues: {
			title: course.title,
			instructor: course.instructor,
			startDate: moment(course.startDate).format("jYYYY/jMM/jDD"),
			endDate: moment(course.endDate).format("jYYYY/jMM/jDD"),
			time: course.time,
			place: course.place,
			status: course.status,
		},
		resolver: zodResolver(schema),
	});

	const {
		control,
		formState: { errors, isDirty, isSubmitting, isSubmitSuccessful },
		handleSubmit: onSubmit,
		setError,
	} = form;

	async function handleSubmit(values: FormData) {
		try {
			const updatedCourse = await updateCourse(course.id, {
				title: values.title,
				instructor: values.instructor,
				startDate: moment(values.startDate, "jYYYY/jMM/jDD").toDate(),
				endDate: moment(values.endDate, "jYYYY/jMM/jDD").toDate(),
				time: values.time,
				place: values.place,
				status: values.status,
			});

			toast.success("اطلاعات دوره آموزشی با موفقیت بروزرسانی شد.");

			handleCourseUpdate({
				...updatedCourse,
			});
		} catch (err: any) {
			console.error(err);
			setError("root.server", {
				message: err?.message || "خطای نامشخصی در هنگام ثبت اطلاعات رخ داد.",
			});
		}
	}

	useEffect(() => {
		if (isSubmitSuccessful) {
			onCancel();
		}
	}, [isSubmitSuccessful, onCancel]);

	return (
		<CardContent>
			<Form {...form}>
				<form onSubmit={onSubmit(handleSubmit)}>
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

						<div className="flex gap-3">
							<Button disabled={!isDirty} variant="primary">
								<span>بروزرسانی</span>
								{isSubmitting && <Loading intent="white" size="xs" />}
							</Button>

							<Button variant="ghost" onClick={() => onCancel()}>
								بازگشت
							</Button>
						</div>
					</fieldset>
				</form>
			</Form>
		</CardContent>
	);
}

export { CourseInfoForm };
