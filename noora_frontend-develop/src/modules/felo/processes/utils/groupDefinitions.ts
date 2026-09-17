import { getObjectEntries } from "@/utils/object/getObjectEntries";

import { Process } from "../models";

const groupDefinitions = (definitions: Process[]) => {
	const inspect = definitions.filter((option) =>
		option.key.startsWith("Inspect"),
	);

	const sampling = definitions.filter((option) =>
		option.key.endsWith("Sampling"),
	);

	const financial = definitions.filter((option) =>
		option.key.startsWith("Financial"),
	);

	const others = definitions.filter(
		(option) =>
			!option.key.startsWith("Inspect") &&
			!option.key.endsWith("Sampling") &&
			!option.key.startsWith("Financial"),
	);

	const groupedData = {
		inspect,
		sampling,
		financial,
		others,
	};

	getObjectEntries(groupedData).map(([key, processes]) => {
		if (processes.length === 0) {
			delete groupedData[key];
		}
	});

	return groupedData;
};
export { groupDefinitions };
