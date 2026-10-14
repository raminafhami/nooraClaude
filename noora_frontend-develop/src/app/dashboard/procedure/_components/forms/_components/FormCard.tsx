"use client";

import { useRouter } from "next/navigation";

import {
	Card,
	CardContent,
	CardHeader,
	CardIcon,
	CardTitle,
} from "@/components/ui/card";

import { Form } from "@/formBuilder/models/Form";

import { FormStatusBadge } from "./FormStatusBadge";
import { getFormCategoryIcon } from "./formCategoryIcons";

function FormCard({ form }: { form: Form }) {
	const router = useRouter();
	const Icon = getFormCategoryIcon(form.category?.title);

	return (
		<Card
			className="cursor-pointer transition-shadow hover:shadow-lg"
			onClick={() => router.push(`/dashboard/procedure/forms/${form.id}`)}
		>
			<CardHeader className="items-center text-center">
				<CardIcon className="mx-auto size-14 text-xl">
					<Icon size={24} />
				</CardIcon>
				<CardTitle className="w-full justify-center whitespace-normal break-words text-center">
					{form.title}
				</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-col items-center gap-2 text-center">
				<span className="text-xs text-muted-foreground" dir="ltr">
					{form.code}
				</span>
				<span className="text-xs text-muted-foreground">
					{form.category?.title ?? "-"}
				</span>
				<FormStatusBadge status={form.status} />
			</CardContent>
		</Card>
	);
}

export { FormCard };
