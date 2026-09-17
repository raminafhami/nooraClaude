import { FaPeopleArrows } from "react-icons/fa6";

import { DataCard } from "../../shared/DataCard";

function StaticCardTwo() {
	return (
		<DataCard
			color="cyan"
			icon={FaPeopleArrows}
			title="نرخ تبدیل مشتریان"
			value="-"
		/>
	);
}

export { StaticCardTwo };
