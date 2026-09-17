"use client";

import { FaFolderOpen } from "react-icons/fa6";

import { File } from "../../models/File";
import { FileType } from "../../models/FileType";
import { FilesView } from "./FilesView";
import { FileUpload } from "./FileUpload";

function FolderView({
	name,
	title,
	types,
	files,
	onUpload,
	onDelete,
}: {
	name: string;
	title: string;
	types: FileType[];
	files: File[];
	onUpload: (file: any, folder: string, types: string[]) => Promise<void>;
	onDelete: (fileId: string) => Promise<void>;
}) {
	// const notUploadTypes = types;
	const notUploadTypes = types.filter(
		(type) =>
			type.multiple ||
			files.filter((x) => x.types.find((y) => y.name === type.name)).length ===
				0,
	);

	return (
		<div className="space-y-4">
			<div className="flex items-center">
				<FaFolderOpen />
				<span className="ms-2">{title}</span>
			</div>
			{files.length !== 0 && (
				<>
					<div className="h-1 rounded-lg bg-gray-100"></div>
					<FilesView items={files} onDelete={onDelete} />
				</>
			)}

			{notUploadTypes.length !== 0 && (
				<>
					<div className="h-1 rounded-lg bg-gray-100"></div>
					<FileUpload
						folder={name}
						types={notUploadTypes}
						onUpload={onUpload}
					/>
				</>
			)}
		</div>
	);
}

export { FolderView };
