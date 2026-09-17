import { Metadata } from "next";
import { FaAngleRight, FaPencilAlt } from "react-icons/fa";

import { DynamicLink } from "@/components/ui/dynamic-link";
import { Layout } from "@/ui/Layout";

import { RoleInformation } from "./_components";

export const revalidate = 0;

export const metadata: Metadata = {
	title: "Role Details",
};

interface Props {
	params: {
		id: string;
	};
}

export default async function Page({ params: { id } }: Props) {
	return (
		<Layout.Root>
			<Layout.Head title="اطلاعات نقش">
				<div className="ms-6 flex grow gap-x-2">
					<DynamicLink
						className="flex items-center rounded-lg bg-primary-500 px-3 py-1 text-white transition hover:bg-primary-550 focus:bg-primary-550"
						href={`/dashboard/admin/roles/${id}/edit`}
					>
						<FaPencilAlt className="text-2xs" />
						<span className="ms-1">ویرایش</span>
					</DynamicLink>
					<DynamicLink
						className="flex items-center rounded-lg border border-gray-200 bg-white px-3 py-1 text-black transition hover:bg-gray-100 focus:bg-gray-100"
						href={`/dashboard/admin/roles`}
					>
						<FaAngleRight className="text-2xs" />
						<span className="ms-1">بازگشت</span>
					</DynamicLink>
				</div>
			</Layout.Head>
			<Layout.Content>
				<RoleInformation id={id} />
			</Layout.Content>
		</Layout.Root>
	);
}
