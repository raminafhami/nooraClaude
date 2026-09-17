import { Metadata } from "next";

import { PageWidget } from "@/inspection/flows/source/pages/PageWidget";

const metadata: Metadata = {
	title: "Inspection Case",
};

function SourceCasePage({
	params: { id },
}: {
	params: {
		id: string;
	};
}) {
	return <PageWidget id={id} />;
}

export { metadata };
export default SourceCasePage;
