"use client";

import { useCallback, useState } from "react";
import { FaPeopleGroup, FaUserPlus } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardIcon,
	CardNav,
	CardTitle,
} from "@/components/ui/card";
import { getCourseById } from "@/courses/services/getCourseById";
import { removeParticipantsFromCourse } from "@/courses/services/removeParticipantsFromCourse";
import { User } from "@/identity/users/models/User";

import { useCourseContext } from "../useCourseContext";
import { CourseParticipantAddDialog } from "./CourseParticipantAddDialog";
import { CourseParticipantsTable } from "./CourseParticipantsTable";

function CourseParticipantsWidget() {
	const {
		course: { id: courseId },
		handleCourseUpdate,
	} = useCourseContext();

	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<string>();

	const queryFn = useCallback(async () => {
		try {
			setIsLoading(true);
			setError(undefined);

			const course = await getCourseById(courseId);

			handleCourseUpdate({
				participantIds: course.participantIds,
				participantsCount: course.participantsCount,
				participants: course.participants,
			});
		} catch (err) {
			console.error(err);
			setError("خطای نامشخصی در هنگام دریافت اطلاعات رخ داد.");
		} finally {
			setIsLoading(false);
		}
	}, [courseId, handleCourseUpdate]);

	// participants add dialog
	const [addDialog, setAddDialog] = useState<boolean>(false);

	const handleAddDialogOpen = useCallback(() => {
		setAddDialog(true);
	}, []);

	const handleAddDialogClose = useCallback(() => {
		setAddDialog(false);
		queryFn();
	}, [queryFn]);

	// participant delete action
	const [inDelete, setInDelete] = useState<User>();

	const handleParticipantDelete = useCallback(
		async (participant: User) => {
			if (isLoading || inDelete) return;

			try {
				setError(undefined);
				setInDelete(participant);

				await removeParticipantsFromCourse(courseId, [participant.id]);
				await queryFn();
			} catch (err: any) {
				console.error(err);
				setError(
					err?.message || "خطای نامشخصی در هنگام حذف شرکت کننده رخ داد.",
				);
			} finally {
				setInDelete(undefined);
			}
		},
		[courseId, isLoading, inDelete, queryFn],
	);

	return (
		<>
			<div className="col-span-full 2xl:col-span-8">
				<Card>
					<CardHeader orientation="horizontal">
						<CardTitle>
							<CardIcon>
								<FaPeopleGroup />
							</CardIcon>
							شرکت کنندگان
						</CardTitle>
						<CardNav>
							<Button
								disabled={isLoading || !!inDelete}
								variant="primary"
								onClick={handleAddDialogOpen}
							>
								<FaUserPlus />
								<span>افزودن شرکت کننده جدید</span>
							</Button>
						</CardNav>
					</CardHeader>
					<CardContent className="px-0">
						<CourseParticipantsTable
							loading={isLoading || !!inDelete}
							onParticipantDelete={handleParticipantDelete}
						/>
					</CardContent>
				</Card>
			</div>

			<CourseParticipantAddDialog
				open={addDialog}
				onClose={handleAddDialogClose}
			/>
		</>
	);
}

export { CourseParticipantsWidget };
