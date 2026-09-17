"use client";

import { useEffect, useState } from "react";
import { FaCheck, FaPlus, FaX } from "react-icons/fa6";
import { useDebounce } from "use-debounce";

import GetAllProjectsTasksLabels from "@/api/tasks-manager/getAllProjectsTasksLabels";
import PostProjectsTasksLabel from "@/api/tasks-manager/postProjectsTasksLabel";
import {
	Command,
	CommandEmpty,
	CommandInput,
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
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

import { ProjectTaskLabel } from "../models/ProjectTaskLabel";

function ProjectLabelSelect({
	disabled,
	value,
	onChange,
}: {
	disabled?: boolean;
	value: ProjectTaskLabel[] | undefined;
	onChange: (labels: ProjectTaskLabel[] | undefined) => void;
}) {
	const [isOpen, setIsOpen] = useState<boolean>(false);

	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

	const [items, setItems] = useState<ProjectTaskLabel[]>();

	useEffect(() => {
		(async () => {
			if (!debouncedSearchTerm) {
				setItems(undefined);
				return;
			}

			try {
				setIsLoading(true);
				setItems(undefined);

				const { result: labels } = await GetAllProjectsTasksLabels({
					page: 0,
					size: 100,
					searchByName: debouncedSearchTerm,
				});

				setItems(labels.data);
			} finally {
				setIsLoading(false);
			}
		})();
	}, [debouncedSearchTerm]);

	const [isPending, setIsPending] = useState<boolean>(false);

	useEffect(() => {
		if (!isOpen) {
			setSearchTerm("");
		}
	}, [isOpen]);

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger
				className={cn(inputClasses, "flex w-full")}
				disabled={disabled}
				onClick={(event) => {
					if (disabled) {
						event.preventDefault();
					}
				}}
			>
				<div className="truncate">{value?.map((x) => x.title).join("، ")}</div>

				{!!value?.length && !disabled && (
					<div
						className="ms-auto flex h-full w-4 cursor-pointer items-center justify-center text-muted-foreground"
						onClick={(event) => {
							event.preventDefault();
							onChange(undefined);
						}}
					>
						<FaX size={10} />
					</div>
				)}
			</PopoverTrigger>

			<PopoverContent className="p-0">
				<Command shouldFilter={false}>
					<CommandInput
						placeholder="جستجو"
						value={searchTerm}
						slotProps={{
							root: { className: cn(!items && !isLoading && "border-b-0") },
						}}
						onValueChange={setSearchTerm}
					/>

					<CommandList className="max-h-40">
						{isLoading && <CommandLoading>در حال جستجو...</CommandLoading>}

						{/* {!!items && <CommandEmpty>هیچ موردی یافت نشد.</CommandEmpty>} */}

						{items?.map((item) => {
							const isSelected = value?.some((x) => x.id === item.id);

							return (
								<CommandItem
									key={item.id}
									className="cursor-pointer"
									value={item.id}
									onSelect={() => {
										if (isSelected) {
											onChange(value!.filter((x) => x.id !== item.id));
										} else {
											onChange([...(value ?? []), item]);
										}

										// setIsOpen(false);
									}}
								>
									<div className="w-4">{isSelected && <FaCheck />}</div>
									<div>{item.title}</div>
								</CommandItem>
							);
						})}

						{!isLoading &&
							debouncedSearchTerm &&
							items &&
							!items?.some((x) => x.title === debouncedSearchTerm) && (
								<CommandItem
									className="cursor-pointer"
									disabled={isPending}
									value="unknown"
									onSelect={async () => {
										try {
											setIsPending(true);

											const createdLabel = await PostProjectsTasksLabel({
												title: debouncedSearchTerm,
											}).then((response) => response.result);

											onChange([...(value ?? []), createdLabel]);

											setItems((items) => [...(items ?? []), createdLabel]);
										} finally {
											setIsPending(false);
										}
									}}
								>
									<div className="w-4">
										<Spinner loading={isPending} size="xs">
											<FaPlus />
										</Spinner>
									</div>
									<span>{`ایجاد برچسب جدید «${debouncedSearchTerm}»`}</span>
								</CommandItem>
							)}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}

export { ProjectLabelSelect };
