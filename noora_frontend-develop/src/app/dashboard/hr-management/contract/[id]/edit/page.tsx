import { Metadata } from "next";

import { Layout } from "@/ui/Layout";

import { ContractEditForm } from "./_components/ContractEditForm";

export const revalidate = 0;

export const metadata: Metadata = {
	title: "Contract Edit",
};

interface Props {
	params: {
		id: string;
	};
}

export default function Page({ params: { id } }: Props) {
	return (
		<Layout.Root>
			<Layout.Head title="ویرایش قرارداد"></Layout.Head>
			<Layout.Content>
				<ContractEditForm id={id} />
			</Layout.Content>
		</Layout.Root>
	);
}
