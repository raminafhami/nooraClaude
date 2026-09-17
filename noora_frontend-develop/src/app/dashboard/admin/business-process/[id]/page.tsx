import { Metadata } from "next";

import { ProcessPage } from "./_module/ProcessPage";

const metadata: Metadata = {
	title: "Process Details",
};

function Page({ params: { id } }: { params: { id: string } }) {
	return <ProcessPage processKey={id} />;
}

export { metadata };
export default Page;
