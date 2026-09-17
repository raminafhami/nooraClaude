"use client";

import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { FaCheck, FaPlus, FaX } from "react-icons/fa6";
import { toast } from "sonner";

import GetAllProjectsTasksLabels from "@/api/tasks-manager/getAllProjectsTasksLabels";
import PostProjectsTasksLabel from "@/api/tasks-manager/postProjectsTasksLabel";
import { Badge, badgeVariants } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { ProjectTaskLabel } from "@/projects/models/ProjectTaskLabel";

const AddProjectLabel = ({
	labels,
	setLabels,
}: {
	labels: ProjectTaskLabel[];
	setLabels: Dispatch<SetStateAction<ProjectTaskLabel[]>>;
}) => {
	const [allLabels, setAllLabels] = useState<ProjectTaskLabel[]>([]);
	const [isPending, setIsPending] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [labelSearchTerm, setLabelSearchTerm] = useState<string>("");

	const filteredLabels = useMemo<ProjectTaskLabel[]>(
		() =>
			labelSearchTerm
				? allLabels.filter((x) => x.title.includes(labelSearchTerm))
				: allLabels,
		[labelSearchTerm, allLabels],
	);

	const handleLabelSelect = (label: ProjectTaskLabel) => {
		const alreadySelected = labels.some((x) => x.id === label.id);

		if (alreadySelected) {
			setLabels((prev) => prev.filter((x) => x.id !== label.id));
		} else {
			setLabels((prev) => [...prev, label]);
		}
	};

	useEffect(() => {
		setIsLoading(true);
		(async () => {
			try {
				const labels = await GetAllProjectsTasksLabels({
					page: 0,
					size: 9999,
				}).then((response) => response.result.data);

				setAllLabels(labels);
			} catch (err: unknown) {
				console.error(err);
				toast.error("خطای نامشخصی در هنگام دریافت برچسب ها رخ داد.");
			}
			setIsLoading(false);
		})();
	}, []);

	const handleLabelCreate = async () => {
		try {
			setIsPending(true);
			const createdLabel = await PostProjectsTasksLabel({
				title: labelSearchTerm,
			}).then((response) => response.result);

			setAllLabels((prev) => [...prev, createdLabel]);
			setLabels((prev) => [...prev, createdLabel]);
		} catch (err: any) {
			console.error(err);
			toast.error("خطای نامشخصی در هنگام ایجاد برچسب رخ داد.");
		} finally {
			setIsPending(false);
		}
	};

	function handleLabelRemove(id: string) {
		setLabels((prev) => prev.filter((label) => label.id !== id));
	}

	return (
		<div className="space-y-2 px-2">
			<label className="w-full select-none">برچسب ها</label>

			<div className="flex flex-wrap items-end gap-2">
				<Popover>
					<PopoverTrigger
						className={cn(badgeVariants(), "bg-gray-600 px-3 py-1 text-white")}
					>
						<FaPlus />
						<span>افزودن</span>
					</PopoverTrigger>
					<PopoverContent align="start" className="w-full min-w-40 p-0">
						<Command shouldFilter={false}>
							<CommandInput
								value={labelSearchTerm}
								onValueChange={setLabelSearchTerm}
							/>
							<CommandList className="py-1">
								{isLoading && (
									<CommandLoading>
										<Spinner size="xs" />
									</CommandLoading>
								)}
								<CommandEmpty>هیچ موردی یافت نشد.</CommandEmpty>
								<CommandGroup>
									{filteredLabels.map((label) => (
										<CommandItem
											className="rounded-none"
											value={label.id}
											key={label.id}
											onSelect={() => handleLabelSelect(label)}
										>
											<div className="w-4">
												{labels.some((x) => x.id === label.id) && <FaCheck />}
											</div>
											<span>{label.title}</span>
										</CommandItem>
									))}
									{labelSearchTerm &&
										filteredLabels &&
										!filteredLabels.some(
											(x) => x.title === labelSearchTerm,
										) && (
											<CommandItem
												className="rounded-none"
												disabled={isPending}
												value=""
												onSelect={handleLabelCreate}
											>
												<div className="w-4">
													<Spinner loading={isPending} size="xs">
														<FaPlus />
													</Spinner>
												</div>
												<span>{`ایجاد برچسب جدید «${labelSearchTerm}»`}</span>
											</CommandItem>
										)}
								</CommandGroup>
							</CommandList>
						</Command>
					</PopoverContent>
				</Popover>

				{labels.map((label) => {
					return (
						<Badge key={label.id} className="bg-white text-gray-900">
							<FaX
								className="cursor-pointer text-2xs"
								onClick={() => handleLabelRemove(label.id)}
							/>
							<span>{label.title}</span>
						</Badge>
					);
				})}
			</div>
		</div>
	);
};

export { AddProjectLabel };
