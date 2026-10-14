"use client";

import { useParams } from "next/navigation";

import { AssignmentDetailPage } from "./_components/AssignmentDetailPage";

export default function AssignmentDetailClientPage() {
	const params = useParams();
	const assignmentId = params?.assignmentId as string;

	return <AssignmentDetailPage assignmentId={assignmentId} />;
}
