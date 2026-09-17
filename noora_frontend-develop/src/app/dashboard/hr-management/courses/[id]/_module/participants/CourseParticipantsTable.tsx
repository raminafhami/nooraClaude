"use client";

import {
	Table,
	TableBody,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { User } from "@/identity/users/models/User";

import { useCourseContext } from "../useCourseContext";
import { CourseParticipantsTableRow } from "./CourseParticipantsTableRow";

function CourseParticipantsTable({
	loading,
	onParticipantDelete,
}: {
	loading: boolean;
	onParticipantDelete: (participant: User) => void;
}) {
	const { course } = useCourseContext();

	return (
		<Table
			loading={loading}
			slotProps={{
				root: {
					className: "border-x-0 rounded-none",
				},
			}}
		>
			<TableHeader>
				<TableRow>
					<TableHead className="w-1">#</TableHead>
					<TableHead>نام</TableHead>
					<TableHead className="w-48">کد ملی</TableHead>
					<TableHead className="w-48">شماره همراه</TableHead>
					<TableHead className="w-72">پست الکترونیک</TableHead>
					<TableHead className="w-1">عملیات</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{course.participants?.map((participant, index) => (
					<CourseParticipantsTableRow
						key={participant.id}
						participant={participant}
						index={index}
						onDelete={onParticipantDelete}
					/>
				))}
			</TableBody>
		</Table>
	);
}

export { CourseParticipantsTable };
