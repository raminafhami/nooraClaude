"use client";

import { useParams } from "next/navigation";

import { FormDetailPage } from "./_components/FormDetailPage";

export default function FormDetailClientPage() {
	const params = useParams();
	const formId = params?.id as string;

	return <FormDetailPage formId={formId} />;
}
