import { Metadata } from "next";
import { FaAngleRight } from "react-icons/fa";

import { DynamicLink } from "@/components/ui/dynamic-link";
import { Layout } from "@/ui/Layout";

import { JobEditForm } from "./_components/JobEditForm";

export const revalidate = 0;

export const metadata: Metadata = {
	title: "Edit Job",
};

interface Props {
	params: {
		id: string;
	};
}

export default async function Page({ params: { id } }: Props) {
	return (
		<Layout.Root>
			<Layout.Head title="ویرایش شرح شغل">
				<div className="ms-6 flex grow">
					<DynamicLink
						className="flex items-center rounded-lg border border-gray-200 bg-white px-3 py-1 text-black transition hover:bg-gray-100 focus:bg-gray-100"
						href={`/dashboard/hr-management`}
					>
						<FaAngleRight className="text-2xs" />
						<span className="ms-1">بازگشت</span>
					</DynamicLink>
				</div>
			</Layout.Head>
			<Layout.Content>
				<JobEditForm id={id} />
			</Layout.Content>
		</Layout.Root>
	);
}
