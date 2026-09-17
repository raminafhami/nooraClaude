import { Metadata } from "next";

import { PageWidget } from "@/inspection/flows/boushehrSampling/pages/PageWidget";

const metadata: Metadata = {
	title: "Inspection Case",
};

function Page({
	params: { id },
}: {
	params: {
		id: string;
	};
}) {
	return <PageWidget id={id} />;
}

export { metadata };
export default Page;
