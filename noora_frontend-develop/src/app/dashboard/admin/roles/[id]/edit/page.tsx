import { Metadata } from "next";
import { FaAngleRight } from "react-icons/fa";

import { DynamicLink } from "@/components/ui/dynamic-link";
import { Layout } from "@/ui/Layout";

import { RoleEditForm } from "./_components";

export const revalidate = 0;

export const metadata: Metadata = {
	title: "Edit Role",
};

interface Props {
	params: {
		id: string;
	};
}

export default async function Page({ params: { id } }: Props) {
	return (
		<Layout.Root>
			<Layout.Head title="ویرایش نقش">
				<div className="ms-6 flex grow">
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
				<RoleEditForm id={id} />
			</Layout.Content>
		</Layout.Root>
	);
}
