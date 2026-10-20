"use client";

import { useParams } from "next/navigation";

import { UserFormHistoryPage } from "./_components/UserFormHistoryPage";

export default function UserFormHistoryClientPage() {
	const params = useParams();
	const formId = params?.id as string;
	const userId = params?.userId as string;

	return <UserFormHistoryPage formId={formId} userId={userId} />;
}
