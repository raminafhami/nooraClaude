"use client";

import { useParams } from "next/navigation";

import { ReceivedFormDetail } from "./_components/ReceivedFormDetail";

export default function ReceivedFormClientPage() {
	const params = useParams();
	const shareId = params?.shareId as string;

	return <ReceivedFormDetail shareId={shareId} />;
}
