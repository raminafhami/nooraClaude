import { Metadata } from "next";

import { Layout } from "@/ui/Layout";

import { ContractDetails } from "./_module/ContractDetails";

export const revalidate = 0;

export const metadata: Metadata = {
	title: "Contract Information",
};

interface Props {
	params: {
		id: string;
	};
}

export default function Page({ params: { id } }: Props) {
	return (
		<Layout.Root>
			<Layout.Head title="نمایش قرارداد"></Layout.Head>
			<Layout.Content>
				<ContractDetails contractId={id} />
			</Layout.Content>
		</Layout.Root>
	);
}
