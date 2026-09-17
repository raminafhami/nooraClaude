"use client";

import { forwardRef, useEffect, useState } from "react";
import { FaCheck } from "react-icons/fa6";

import {
	Command,
	CommandEmpty,
	CommandItem,
	CommandList,
	CommandLoading,
} from "@/components/ui/command";
import { inputClasses } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { ProcessApi } from "@/felo/processes/models";
import { getRawProcessDefinitions } from "@/felo/processes/services/getRawProcessDefinitions";
import { cn } from "@/lib/utils";
import { getObjectEntries } from "@/utils/object/getObjectEntries";

import { InspectionProcessDefinitionInfo } from "../../models/InspectionProcessDefinitionInfo";
import { pickProcessDefinitionInfo } from "../../utils/pickProcessDefinitionInfo";

const InspectionProcessDefinitionSelect = forwardRef<
	HTMLButtonElement,
	{
		disabled?: boolean;
		placeholder?: string;
		value: InspectionProcessDefinitionInfo | undefined;
		onChange: (value: InspectionProcessDefinitionInfo) => void;
	}
>(({ disabled, placeholder, value, onChange }, ref) => {
	const [isOpen, setIsOpen] = useState<boolean>(false);

	const { processDefinitions } = useProcessDefinitions();

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger
				ref={ref}
				className={cn(inputClasses, "flex w-full")}
				disabled={disabled}
			>
				<div className="truncate">{value?.name || placeholder}</div>
			</PopoverTrigger>

			<PopoverContent className="p-0">
				<Command>
					<CommandList className="py-2">
						{!processDefinitions && (
							<CommandLoading>در حال دریافت اطلاعات...</CommandLoading>
						)}

						<CommandEmpty>هیچ موردی یافت نشد.</CommandEmpty>

						{processDefinitions?.map((item) => (
							<CommandItem
								key={item.key}
								className="cursor-pointer rounded-none"
								value={item.key}
								onSelect={() => {
									onChange(item);
									setIsOpen(false);
								}}
							>
								<div className="w-4">
									{value?.key === item.key && <FaCheck />}
								</div>

								<div>{item.name}</div>
							</CommandItem>
						))}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
});
InspectionProcessDefinitionSelect.displayName =
	"InspectionProcessDefinitionSelect";

function useProcessDefinitions() {
	const [definitions, setDefinitions] =
		useState<InspectionProcessDefinitionInfo[]>();

	useEffect(() => {
		const getProcessOptions = async () => {
			try {
				const processes = await getRawProcessDefinitions({
					filters: {
						$or: [{ key: { $regex: `^Inspection_Case` } }],
					},
					sort: { name: "asc" },
				});

				const uniqueDefinitions: Record<string, ProcessApi> = {};
				processes.forEach((definition) => {
					uniqueDefinitions[definition.key] = definition;
				});

				const definitions = getObjectEntries(uniqueDefinitions).map(
					([_, definition]) => pickProcessDefinitionInfo(definition),
				);

				setDefinitions(definitions);
			} catch (err) {
				console.error(err);
			}
		};

		getProcessOptions();
	}, []);

	return {
		processDefinitions: definitions,
	};
}

export { InspectionProcessDefinitionSelect };
