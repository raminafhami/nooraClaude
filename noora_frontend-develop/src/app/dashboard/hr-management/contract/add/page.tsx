import { Metadata } from "next";
import { FaAngleRight } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { DynamicLink } from "@/components/ui/dynamic-link";
import { Layout } from "@/ui/Layout";

import { ContractCreateForm } from "./_components/ContractCreateForm";

const metadata: Metadata = {
	title: "Add Contract",
};

async function ContractCreatePage() {
	return (
		<Layout.Root>
			<Layout.Head title="ثبت قرارداد جدید">
				<div className="ms-6 flex grow">
					<Button asChild variant="outline">
						<DynamicLink href="/dashboard/hr-management?tab=contracts">
							<FaAngleRight />
							<span>بازگشت</span>
						</DynamicLink>
					</Button>
				</div>
			</Layout.Head>
			<Layout.Content>
				<ContractCreateForm />
			</Layout.Content>
		</Layout.Root>
	);
}

export { metadata };
export default ContractCreatePage;
