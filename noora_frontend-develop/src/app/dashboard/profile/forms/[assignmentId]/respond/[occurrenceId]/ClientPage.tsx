"use client";

import { useParams } from "next/navigation";

import { RespondPage } from "./_components/RespondPage";

export default function RespondClientPage() {
	const params = useParams();
	const occurrenceId = params?.occurrenceId as string;

	return <RespondPage occurrenceId={occurrenceId} />;
}
