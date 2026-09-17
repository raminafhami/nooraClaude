"use client";

import { useEffect, useState } from "react";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { Spinner } from "@/components/ui/spinner";
import { File } from "@/felo/files/models/File";
import { FileType } from "@/felo/files/models/FileType";
import { Folder } from "@/felo/files/models/Folder";
import { cn } from "@/lib/utils";
import { Loading } from "@/ui/Loader";

import { deleteInstanceFile } from "../../services/deleteFile";
import { getDocuments } from "../../services/getDocuments";
import { uploadInstanceFile } from "../../services/uploadFile";
import { FolderView } from "./FolderView";

function FilesWidget({ instanceId }: { instanceId: string }) {
	const { identity } = useLoggedInUser();

	const [isLoading, setIsLoading] = useState<boolean>(true);

	const [files, setFiles] = useState<File[]>();
	const [fileTypes, setFileTypes] = useState<FileType[]>();
	const [folders, setFolders] = useState<Folder[]>();
	const [selectedTab, setSelectedTab] = useState<string>("all");

	useEffect(() => {
		async function loadDocuments() {
			setIsLoading(true);

			const { files, folders, fileTypes } = await getDocuments({ instanceId });

			setFiles(files);
			setFolders(folders);
			setFileTypes(fileTypes);

			setIsLoading(false);
		}

		loadDocuments();
	}, [instanceId]);

	async function handleUpload(file: any, folder: string, types: string[]) {
		try {
			const uploadedFile = await uploadInstanceFile({
				instanceId: instanceId,
				file,
				folder,
				fileTypes: types,
			});

			setFiles((prev) => [
				...(prev ?? []),
				{
					id: uploadedFile.id,
					name: uploadedFile.name,
					folder,
					types: types.map((x) => fileTypes!.find((type) => type.name === x)!),
					uploadById: identity.id,
					uploadBy: identity!.fullname,
					uploadAt: uploadedFile.createAt,
				},
			]);
		} catch (err) {
			console.log(err);
		}
	}

	async function handleDelete(fileId: string) {
		try {
			await deleteInstanceFile({ id: fileId });
			setFiles((files) => [...files!.filter((file) => file.id !== fileId)]);
		} catch (err) {
			console.error(err);
		}
	}

	if (!isLoading && (!fileTypes?.length || !folders?.length)) {
		return <>بخش مدارک برای این فرایند تعریف نشده است.</>;
	}

	return (
		<Spinner loading={isLoading || !fileTypes || !folders || !files}>
			<div className="flex max-w-4xl flex-col rounded-2xl border border-gray-100 md:flex-row">
				<div className="shrink-0 overflow-hidden rounded-t-2xl bg-gray-100 md:min-h-[12rem] md:basis-[16rem] md:rounded-e-none md:rounded-s-2xl">
					<div className="my-4 px-4 md:pe-0">
						{folders?.map((folder) => (
							<div
								key={folder.name}
								className={cn(
									"cursor-pointer truncate rounded-xl px-4 py-1 text-xs leading-6 transition-colors md:rounded-e-none",
									selectedTab === folder.name && "bg-white",
								)}
								onClick={() => setSelectedTab(folder.name)}
							>
								{folder.title}
							</div>
						))}
					</div>
				</div>
				<div className="h-96 grow overflow-auto px-4 py-8 md:px-8">
					{folders?.map(
						(folder) =>
							selectedTab === folder.name && (
								<FolderView
									key={folder.name}
									{...folder}
									files={
										files?.filter((file) => file.folder === folder.name) ?? []
									}
									onUpload={handleUpload}
									onDelete={handleDelete}
								/>
							),
					)}
				</div>
			</div>
		</Spinner>
	);
}

export { FilesWidget };
