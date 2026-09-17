import { ReactNode, useEffect, useState } from "react";
import { FaFolderOpen } from "react-icons/fa6";

import {
	Card,
	CardHeader,
	CardIcon,
	CardNav,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { File } from "@/felo/files/models/File";
import { getDocuments } from "@/felo/files/services/getDocuments";
import { Loading } from "@/ui/Loader";

import { FileType } from "../../models/FileType";
import { DocumentItem } from "./DocumentItem";
import { DocumentUnavailableItem } from "./DocumentUnavailableItem";

function DocumentsView({
	title,
	instanceId,
	folders,
	types,
	requiredTypes,
	seperator = true,
}: {
	title?: ReactNode;
	instanceId: string;
	folders?: string[];
	types?: string[];
	requiredTypes?: string[];
	seperator?: boolean;
}) {
	const [mounted, setMounted] = useState<boolean>(false);

	const [isLoading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [files, setFiles] = useState<File[]>([]);
	const [unavailables, setUnavailables] = useState<FileType[] | null>(null);

	useEffect(() => {
		async function loadDocuments() {
			try {
				setLoading(true);

				const { files: documentFiles, fileTypes } = await getDocuments({
					instanceId,
					types,
				});

				let files = documentFiles;

				if (folders && folders.length) {
					files = files.filter((x) => folders.includes(x.folder));
				}

				setFiles(files);

				if (requiredTypes && requiredTypes.length) {
					// set required but not uploaded file types
					let unavailableTypes = fileTypes.filter((x) =>
						requiredTypes.includes(x.name),
					);

					if (unavailableTypes.length) {
						files.forEach((x) => {
							let foundTypes = x.types.filter((y) =>
								unavailableTypes.find((z) => y.name === z.name),
							);

							if (foundTypes.length) {
								unavailableTypes = unavailableTypes.filter(
									(y) => !foundTypes.find((z) => y.name === z.name),
								);
							}
						});

						setUnavailables(unavailableTypes);
					}
				}
			} catch (err: any) {
				console.log(err);
				setError(err?.message ?? "خطایی در هنگام دریافت اطلاعات رخ داد.");
			} finally {
				setLoading(false);
				setMounted(true);
			}
		}

		if (!mounted) {
			loadDocuments();
		}
	}, [instanceId, folders, types, requiredTypes, mounted]);

	return (
		<>
			<div className="col-span-full">
				<Card>
					<CardHeader
						className="gap-8 xs:flex-col sm:flex-row sm:items-start sm:gap-8 md:gap-12"
						orientation="horizontal"
					>
						<CardTitle>
							<CardIcon>
								<FaFolderOpen />
							</CardIcon>
							{title ?? "مدارک"}
						</CardTitle>
						<CardNav className="ms-0 grow">
							{isLoading ? (
								<Loading size="sm">در حال دریافت اطلاعات</Loading>
							) : error ? (
								<div>{error}</div>
							) : (
								<div className="max-h-52 w-full overflow-y-auto pb-1.5 pe-3 ps-1.5 pt-1">
									{unavailables && !!unavailables.length && (
										<div className="space-y-3">
											<div>مدارک ناقص:</div>
											<div className="flex gap-3">
												{unavailables.map((x) => (
													<DocumentUnavailableItem key={x.name} fileType={x} />
												))}
											</div>
										</div>
									)}
									{unavailables &&
										!!unavailables.length &&
										files &&
										!!files.length && <Separator className="my-4 h-1" />}
									{files && !!files.length && (
										<div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5">
											{files?.map((x) => <DocumentItem key={x.id} file={x} />)}
										</div>
									)}
								</div>
							)}
						</CardNav>
					</CardHeader>
				</Card>
			</div>

			{seperator && <Separator className="col-span-full my-5 h-1" />}
		</>
	);
}

export { DocumentsView };
