import { Metadata } from "next";
import { redirect } from "next/navigation";
import { FaAngleRight } from "react-icons/fa";

import { DynamicLink } from "@/components/ui/dynamic-link";
import getUserById from "@/identity/users/services/getUserById";
import { Layout } from "@/ui/Layout";

import { UserWidget } from "./_components";

export const revalidate = 0;

export const metadata: Metadata = {
	title: "Manage User",
};

interface Props {
	params: {
		id: string;
	};
}

export default async function Page({ params: { id } }: Props) {
	const user = await getUserById(id);

	if (!user) {
		redirect("/dashboard/admin/users");
	}

	return (
		<Layout.Root>
			<Layout.Head title={`مدیریت کاربر: ${user.fullname}`}>
				<div className="ms-6 flex grow">
					<DynamicLink
						className="flex items-center rounded-lg border border-gray-200 bg-white px-3 py-1 text-black transition hover:bg-gray-100 focus:bg-gray-100"
						href={`/dashboard/admin/users`}
					>
						<FaAngleRight className="text-2xs" />
						<span className="ms-1">بازگشت به لیست</span>
					</DynamicLink>
				</div>
			</Layout.Head>
			<Layout.Content>
				<UserWidget id={id} />
			</Layout.Content>
		</Layout.Root>
	);
}
