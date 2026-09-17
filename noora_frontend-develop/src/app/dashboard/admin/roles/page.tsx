import { Metadata } from "next";
import { FaPlus } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import { DynamicLink } from "@/components/ui/dynamic-link";
import { Layout } from "@/ui/Layout";

import { RolesWidget } from "./_components";

export const revalidate = 0;

export const metadata: Metadata = {
	title: "Roles",
};

export default function Page() {
	return (
		<Layout.Root>
			<Layout.Head title="نقش ها">
				<div className="ms-6 flex">
					<DynamicLink
						className="flex rounded-lg px-3 py-1"
						href={`/dashboard/admin/roles/add`}
					>
						<Button className="ms-1">
							<FaPlus className="mx-1 text-2xs" />
							افزودن نقش
						</Button>
					</DynamicLink>
				</div>
			</Layout.Head>
			<Layout.Content>
				<RolesWidget />
			</Layout.Content>
		</Layout.Root>
	);
}
