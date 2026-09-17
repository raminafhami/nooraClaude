import { Metadata } from "next";
import { FaAngleRight } from "react-icons/fa6";

import { DynamicLink } from "@/components/ui/dynamic-link";
import { Layout } from "@/ui/Layout";

import { AddNotification } from "./_components/AddNotification";

export const revalidate = 0;

export const metadata: Metadata = {
	title: "Add Personnel",
};

export default async function Page() {
	return (
		<Layout.Root>
			<Layout.Head title="ارسال اعلان جدید">
				<div className="ms-6 flex grow">
					<DynamicLink
						className="flex items-center rounded-lg border border-gray-200 bg-white px-3 py-1 text-black transition hover:bg-gray-100 focus:bg-gray-100"
						href={`/dashboard/notifications`}
					>
						<FaAngleRight className="text-2xs" />
						<span className="ms-1">بازگشت</span>
					</DynamicLink>
				</div>
			</Layout.Head>
			<Layout.Content>
				<AddNotification />
			</Layout.Content>
		</Layout.Root>
	);
}
