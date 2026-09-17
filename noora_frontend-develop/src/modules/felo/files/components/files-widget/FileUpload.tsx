"use client";

import { useRef, useState } from "react";
import { FaCircleExclamation, FaPlus, FaUpload } from "react-icons/fa6";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loading } from "@/ui/Loader";

import { FileType } from "../../models/FileType";

const restrictedFolders: string[] = [
	// "pic"
];

function FileUpload({
	folder,
	types: fileTypes,
	onUpload,
}: {
	folder: string;
	types: FileType[];
	onUpload: (file: any, folder: string, types: string[]) => Promise<void>;
}) {
	const [file, setFile] = useState<any>();
	const [types, setTypes] = useState<{ name: string; isSelected: boolean }[]>(
		[],
	);
	const [isSending, setSending] = useState<boolean>(false);

	const fileInput = useRef<HTMLInputElement>(null);

	async function handleSubmit(file: any, types: string[]) {
		setSending(true);
		await onUpload(file, folder, types);
		setSending(false);
		setFile(undefined);
	}

	if (restrictedFolders.some((x) => x === folder)) {
		return (
			<Alert variant="warn">
				<FaCircleExclamation />
				<AlertDescription>
					امکان بارگذاری در این پوشه وجود ندارد.
				</AlertDescription>
			</Alert>
		);
	}

	return file ? (
		<div key="FileUploadForm">
			<div className="flex flex-col gap-y-3 rounded-lg bg-gray-200 px-6 py-4 md:h-36 md:flex-row">
				<div className="flex w-full shrink-0 basis-16 items-center justify-center place-self-center rounded-lg bg-gray-50 md:h-28">
					{file.name.substring(file.name.lastIndexOf(".") + 1).toUpperCase()}
				</div>
				<div className="grid-cols-full grid grow gap-y-3 text-xs md:ms-4 md:grid-cols-6 md:gap-x-3">
					<div className="col-span-full flex flex-col overflow-hidden md:col-span-5">
						<div className="h-full divide-y divide-gray-100 overflow-auto rounded-lg bg-gray-50">
							{fileTypes
								.filter((x) => types.map((x) => x.name).includes(x.name))
								.map((type) => (
									<div
										key={type.name}
										className={cn(
											"cursor-pointer truncate px-4 py-1 leading-6",
											types.find((x) => x.name === type.name)!.isSelected &&
												"bg-gray-500 text-white",
										)}
										onClick={() => {
											setTypes((types) => [
												...types.map((x) =>
													x.name === type.name
														? { ...x, isSelected: !x.isSelected }
														: x,
												),
											]);
										}}
									>
										{type.title}
									</div>
								))}
						</div>
					</div>

					<div className="col-span-full flex flex-col md:col-span-1">
						<Button
							className="flex h-full w-full items-center justify-center px-0"
							disabled={isSending || !types.find((x) => x.isSelected)}
							variant="primary"
							onClick={async () => {
								await handleSubmit(
									file,
									types.filter((x) => x.isSelected).map((x) => x.name),
								);
							}}
						>
							{isSending ? (
								<Loading size="sm" horizontalPlacement="center" />
							) : (
								<FaUpload />
							)}
						</Button>
					</div>
				</div>
			</div>
		</div>
	) : (
		<div key="FileUploadZone">
			<input
				className="absolute -z-[1] h-[.1px] w-[.1px] overflow-hidden opacity-0"
				type="file"
				accept={fileTypes
					.flatMap((x) => x.extensions.map((x) => `.${x}`))
					.join(",")}
				ref={fileInput}
				onChange={async (e) => {
					if (!e.target.files || e.target.files.length === 0) {
						return;
					}

					const file = e.target.files[0];
					const types = fileTypes
						.filter((x) =>
							x.extensions.includes(
								file.name.split(".").at(-1)?.toLowerCase() ?? "",
							),
						)
						.map((x) => {
							return { name: x.name, isSelected: false };
						});

					if (types.length === 1) {
						await handleSubmit(
							file,
							types.map((x) => x.name),
						);
					} else {
						setFile(file);
						setTypes([...types]);
					}
				}}
			/>
			<div
				className="flex h-24 cursor-pointer items-center justify-center rounded-lg bg-gray-50"
				onClick={() => fileInput.current?.click()}
			>
				<FaPlus />
			</div>
		</div>
	);
}

export { FileUpload };
