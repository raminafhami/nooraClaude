"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FaLeftLong } from "react-icons/fa6";

import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Button } from "@/components/ui/button";
import { DynamicLink } from "@/components/ui/dynamic-link";
import { Course } from "@/courses/models/Course";
import { getCourseById } from "@/courses/services/getCourseById";
import { Layout } from "@/ui/Layout";
import { Loading } from "@/ui/Loader";
import { omitUndefinedProperties } from "@/utils/object/omitUndefinedProperties";

import { CourseContext, CourseContextType } from "./CourseContext";
import { CourseInfoWidget } from "./info/CourseInfoWidget";
import { CourseParticipantsWidget } from "./participants/CourseParticipantsWidget";

function CourseClient({ id }: { id: string }) {
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [course, setCourse] = useState<Course>();

	const handleCourseUpdate = useCallback((course: Partial<Course>) => {
		setCourse(
			(previous) =>
				({
					...(previous ?? {}),
					...(omitUndefinedProperties(course) as Partial<Course>),
				}) as Course,
		);
	}, []);

	const ctxValue = useMemo<CourseContextType>(
		() => ({
			course: course ?? ({} as Course),
			handleCourseUpdate,
		}),
		[course, handleCourseUpdate],
	);

	const queryFn = useCallback(async () => {
		try {
			setIsLoading(true);
			setError(null);

			const course = await getCourseById(id);
			setCourse(course);
		} catch (err) {
			console.error(err);
			setError("خطای نامشخصی در هنگام دریافت اطلاعات رخ داد.");
		} finally {
			setIsLoading(false);
		}
	}, [id]);

	useEffect(() => {
		queryFn();
	}, [queryFn]);

	if (isLoading && !course) {
		return (
			<Loading verticalPlacement="start">در حال دریافت اطلاعات...</Loading>
		);
	}

	return (
		<Layout.Root>
			<Layout.Head title={`دوره آموزشی: ${course?.title ?? "نامشخص"}`}>
				<div className="sm:ms-auto">
					<DynamicLink href="/dashboard/hr-management?tab=courses">
						<Button>
							<FaLeftLong />
							<span>بازگشت به لیست</span>
						</Button>
					</DynamicLink>
				</div>
			</Layout.Head>
			<Layout.Content>
				{course ? (
					<CourseContext.Provider value={ctxValue}>
						<div className="grid grid-cols-12 gap-6">
							<CourseInfoWidget />
							<CourseParticipantsWidget />
						</div>
					</CourseContext.Provider>
				) : (
					<DestructiveAlert>
						<AlertDescription>
							{error || "خطای نامشخصی رخ داد."}
						</AlertDescription>
					</DestructiveAlert>
				)}
			</Layout.Content>
		</Layout.Root>
	);
}

export { CourseClient };
