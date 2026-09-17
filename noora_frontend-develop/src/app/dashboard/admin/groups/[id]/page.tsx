import { Metadata } from "next";

import { GroupWidget } from "./_components/GroupWidget";

export const revalidate = 0;

export const metadata: Metadata = {
	title: "Group Details",
};

interface Props {
	params: {
		id: string;
	};
}

export default function Page({ params: { id } }: Props) {
	return <GroupWidget id={id} />;
}
