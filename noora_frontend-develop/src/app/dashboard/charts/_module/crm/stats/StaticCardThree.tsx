import { FaFaceSmile } from "react-icons/fa6";

import { DataCard } from "../../shared/DataCard";

function StaticCardThree() {
	return (
		<DataCard
			color="red"
			icon={FaFaceSmile}
			title="میزان رضایت مشتریان"
			value="-"
		/>
	);
}

export { StaticCardThree };
