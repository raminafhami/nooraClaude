"use client";

import { useMemo, useState } from "react";
import { FaClock, FaDownload, FaFile, FaTrash, FaUser } from "react-icons/fa6";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { Seperator } from "@/ui/Seperator";
import { TimeRelative } from "@/ui/Time/TimeRelative";

import { File } from "../../models/File";
import { FileDeleteDialog } from "./FileDeleteDialog";

function FileView({
	file: { id, name, types, uploadById, uploadBy, uploadAt },
	isLast = false,
	onDelete,
}: {
	file: File;
	isLast: boolean;
	onDelete: (fileId: string) => Promise<void>;
}) {
	const { identity, isAuthorized } = useLoggedInUser();

	const filename = name.substring(0, name.lastIndexOf("."));

	const [isOpen, setIsOpen] = useState<boolean>(false);

	const canDelete = useMemo<boolean>(() => {
		return isAuthorized({ groups: [] }) || identity.id === uploadById;
	}, [identity.id, uploadById, isAuthorized]);

	return (
		<>
			<div className="space-y-4">
				<div className="flex flex-col md:flex-row">
					<div className="flex shrink-0 basis-24 flex-col space-y-2">
						<div className="flex h-16 w-full items-center justify-center rounded-lg border border-gray-200 text-2xl text-gray-300">
							{name.substring(name.lastIndexOf(".") + 1).toUpperCase()}
						</div>
						<div className="flex justify-center divide-x divide-x-reverse rounded-lg border">
							<a
								className="block px-4 py-2 text-center transition hover:text-primary-500"
								href={`/dashboard/applications/files/${id}`}
							>
								<FaDownload />
							</a>
							{canDelete && (
								<div
									className="block cursor-pointer px-4 py-2 text-center transition hover:text-red-500"
									onClick={() => {
										setIsOpen(true);
									}}
								>
									<FaTrash />
								</div>
							)}
						</div>
					</div>
					<div className="ms-4 grid grow grid-cols-5 gap-x-3 text-xs">
						<div className="col-span-2 flex flex-col gap-y-3 py-4">
							<div className="flex items-center" title={filename}>
								<FaFile />
								<span className="ms-2 overflow-hidden truncate">
									{filename}
								</span>
							</div>
							<div className="flex items-center">
								<FaUser />
								<span className="ms-2">{uploadBy}</span>
							</div>
							<div className="flex items-center">
								<FaClock />
								<div className="ms-2">
									<TimeRelative time={uploadAt} />
								</div>
							</div>
						</div>
						<div className="col-span-3 flex flex-col justify-center">
							<div className="divide-y divide-gray-100 rounded-lg bg-gray-50">
								{types.map((type) => (
									<div key={type.name} className="truncate px-4 py-1 leading-6">
										{type.title}
									</div>
								))}
							</div>
						</div>
					</div>
				</div>

				{!isLast && <Seperator />}
			</div>

			{isOpen && (
				<FileDeleteDialog
					open={isOpen}
					onClose={() => setIsOpen(false)}
					onConfirm={async () => {
						onDelete(id);
					}}
				/>
			)}
		</>
	);
}

export { FileView };
