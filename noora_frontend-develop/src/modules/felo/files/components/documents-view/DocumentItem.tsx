import { FaDownload, FaFile } from "react-icons/fa6";

import { Card } from "@/components/ui/card";
import { File } from "@/felo/files/models/File";

function DocumentItem({ file: { id, name, types } }: { file: File }) {
	return (
		<Card className="flex cursor-default flex-col gap-2 rounded-2xl bg-white p-2 md:flex-row">
			<div className="flex shrink-0 basis-16 flex-col space-y-2">
				<div className="flex h-8 w-full items-center justify-center rounded-xl bg-gray-100 text-sm">
					{name.substring(name.lastIndexOf(".") + 1).toUpperCase()}
				</div>
				<a
					className="flex justify-center rounded-xl border px-4 py-2 transition hover:text-primary-500"
					href={`/dashboard/applications/files/${id}`}
				>
					<FaDownload />
				</a>
			</div>
			<div className="grow space-y-1.5 overflow-hidden text-xs">
				<div className="flex items-center">
					<FaFile />
					<span className="ms-2 overflow-hidden truncate">
						{name.substring(0, name.lastIndexOf("."))}
					</span>
				</div>
				<div
					className="max-h-12 divide-y divide-gray-100 overflow-y-auto rounded-xl bg-gray-100"
					title={types.map((x) => x.title).join("\n")}
				>
					{types.map((type) => (
						<div
							key={type.name}
							className="overflow-hidden truncate px-2 py-0.5 leading-6"
						>
							{type.title}
						</div>
					))}
				</div>
			</div>
		</Card>
	);
}

export { DocumentItem };
