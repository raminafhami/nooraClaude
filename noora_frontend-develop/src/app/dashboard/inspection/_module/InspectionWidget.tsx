"use client";

import { LucideCheck } from "lucide-react";
import dynamic from "next/dynamic";
import { parseAsString, useQueryState } from "nuqs";

import { Button } from "@/components/ui/button";
import { Command, CommandItem, CommandList } from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

type Mode = "instance-list" | "instance-search";

const viewModeOptions = [
	{ label: " درخواست ها", value: "instance" },
	{ label: " قراردادها", value: "contract" },
] as const;

const InstanceList = dynamic(() => import("./instance-list/InstanceList"));
const ContractList = dynamic(() => import("./contract-list/ContractList"));
const ReportGenerator = dynamic(
	() => import("./instance-search/ReportGenerator"),
);

function InspectionWidget() {
	const [mode, setMode] = useQueryState<string>(
		"mode",
		parseAsString.withDefault("instance-list"),
	);

	const [viewMode, setViewMode] = useQueryState<string>(
		"view",
		parseAsString.withDefault(viewModeOptions[0]?.value),
	);

	const selectedViewMode = viewModeOptions.find((x) => x.value === viewMode)!;

	function handleModeChange() {
		const nextMode: Mode =
			mode === "instance-list" ? "instance-search" : "instance-list";

		setMode(nextMode);
	}

	return (
		<>
			<div className="flex flex-col items-center justify-start gap-4 xs:flex-row">
				<Button className="w-full xs:w-48" onClick={handleModeChange}>
					{mode === "instance-search"
						? "نمایش درخواست های بازرسی"
						: "نمایش جستجوی پیشرفته"}
				</Button>

				{mode === "instance-list" && (
					<Popover>
						<PopoverTrigger asChild>
							<Button className="w-full xs:w-48">
								نمایش بر اساس: {selectedViewMode.label}
							</Button>
						</PopoverTrigger>
						<PopoverContent className="p-0">
							<Command>
								<CommandList>
									{viewModeOptions.map((item) => (
										<CommandItem
											key={item.value}
											className="flex items-center"
											value={item.value}
											onSelect={setViewMode}
										>
											<div className="size-4">
												{viewMode === item.value && <LucideCheck size={16} />}
											</div>
											<span>{item.label}</span>
										</CommandItem>
									))}
								</CommandList>
							</Command>
						</PopoverContent>
					</Popover>
				)}
			</div>

			{mode === "instance-list" && (
				<>
					{viewMode === "instance" && <InstanceList />}
					{viewMode === "contract" && <ContractList />}
				</>
			)}

			{mode === "instance-search" && <ReportGenerator />}
		</>
	);
}

export { InspectionWidget };
