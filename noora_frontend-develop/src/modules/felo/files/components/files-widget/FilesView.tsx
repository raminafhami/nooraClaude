"use client";

import { File } from "../../models/File";
import { FileView } from "./FileView";

function FilesView({
	items,
	onDelete,
}: {
	items: File[];
	onDelete: (fileId: string) => Promise<void>;
}) {
	if (!items || items.length === 0) {
		return <></>;
	}

	return (
		<div className="space-y-4">
			{items.map((file, i) => (
				<FileView
					key={file.id}
					file={file}
					isLast={i + 1 == items.length}
					onDelete={onDelete}
				/>
			))}
		</div>
	);
}

export { FilesView };
