"use client";

import { useParams } from "next/navigation";

import { OccurrenceAnswersPage } from "./_components/OccurrenceAnswersPage";

export default function OccurrenceAnswersClientPage() {
	const params = useParams();
	const occurrenceId = params?.occurrenceId as string;

	return <OccurrenceAnswersPage occurrenceId={occurrenceId} />;
}
