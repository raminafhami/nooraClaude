import { Metadata } from "next";
import { FaAngleRight } from "react-icons/fa";

import { DynamicLink } from "@/components/ui/dynamic-link";
import { Layout } from "@/ui/Layout";

import { RoleCreateForm } from "./_components";

export const revalidate = 0;

export const metadata: Metadata = {
	title: "Add Role",
};

export default async function Page() {
	return (
		<Layout.Root>
			<Layout.Head title="افزودن نقش">
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
				<RoleCreateForm />
			</Layout.Content>
		</Layout.Root>
	);
}
