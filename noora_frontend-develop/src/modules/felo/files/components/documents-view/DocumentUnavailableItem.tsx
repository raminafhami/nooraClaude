import { Badge } from "@/components/ui/badge";

import { FileType } from "../../models/FileType";

function DocumentUnavailableItem({ fileType }: { fileType: FileType }) {
	return (
		<Badge
			className="overflow-hidden truncate bg-red-200 px-6 py-0.5 leading-6 text-red-900"
			title={fileType.title}
		>
			{fileType.title}
		</Badge>
	);
}

export { DocumentUnavailableItem };
