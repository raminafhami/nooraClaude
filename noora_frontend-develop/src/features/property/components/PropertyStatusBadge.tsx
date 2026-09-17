import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { PropertyStatus, propertyStatuses } from "../enums/PropertyStatus";
import { Property } from "../models/Property";

const PropertyStatusBadge = ({
	property,
}: {
	property: Pick<Property, "status">;
}) => {
	return (
		<Badge
			className={cn(
				property.status === PropertyStatus.Active &&
					"bg-blue-100 text-blue-900",
				property.status === PropertyStatus.UnderMaintenance &&
					"bg-yellow-100 text-yellow-900",
				property.status === PropertyStatus.Decommissioned &&
					"bg-red-100 text-red-900",
			)}
		>
			{propertyStatuses[property.status]?.title}
		</Badge>
	);
};

export { PropertyStatusBadge };
