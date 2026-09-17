import { Metadata } from "next";

import { ChartsClient } from "./_module/ChartsClient";

const metadata: Metadata = {
	title: "Charts",
};

function ChartsPage() {
	return <ChartsClient />;
}

export { metadata };
export default ChartsPage;
