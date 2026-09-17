import { Identity } from "@/auth/models/Identity";

import { TabItemType } from "./tabs.types";

function getVisibleTabItems(
	items: TabItemType[],
	{ identity }: { identity: Identity | null | undefined },
) {
	const visibleItems =
		identity?.type === "system" || identity?.groups.includes("system-admin")
			? items
			: (items?.filter(
					(x) => !x.authorize || x.authorize(identity ?? undefined),
				) ?? []);

	return visibleItems;
}

export { getVisibleTabItems };
