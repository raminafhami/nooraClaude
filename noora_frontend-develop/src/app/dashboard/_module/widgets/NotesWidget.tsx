"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
	FaChevronDown,
	FaEye,
	FaEyeSlash,
	FaTrash,
	FaX,
} from "react-icons/fa6";
import { z } from "zod";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardNav,
	CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { SelectItemType } from "@/types/SelectItem";
import * as AccordionPrimitive from "@radix-ui/react-accordion";

type Note = {
	title: string;
	description: string;
	priority: NotePriority | null;
	status: NoteStatus;
};

enum NotePriority {
	High = "high",
	Medium = "medium",
	Low = "low",
}

enum NoteStatus {
	Active = "active",
	Completed = "completed",
}

function NotesWidget() {
	const [isShow, setIsShow] = useState<boolean>(true);
	const [items, setItems] = useState<any>([]);

	const handleSubmit = useCallback(
		(note: Pick<Note, "title" | "description" | "priority">) => {
			const nextItems = [...items, { ...note, status: NoteStatus.Active }];
			setItems(nextItems);
			localStorage.setItem("items", JSON.stringify(nextItems));
		},
		[items],
	);

	const handleStatusChange = useCallback(
		(noteIndex: number, status: NoteStatus) => {
			const nextItems = items.map((item: Note, index: number) =>
				index === noteIndex ? { ...item, status } : item,
			);
			setItems(nextItems);
			localStorage.setItem("items", JSON.stringify(nextItems));
		},
		[items],
	);

	const handleDelete = useCallback(
		(noteIndex: number) => {
			const nextItems = items.filter(
				(item: Note, index: number) => index !== noteIndex,
			);
			setItems(nextItems);
			localStorage.setItem("items", JSON.stringify(nextItems));
		},
		[items],
	);

	useEffect(() => {
		const storedItems = localStorage.getItem("items");

		if (storedItems) {
			setItems(JSON.parse(storedItems));
		}
	}, []);

	return (
		<Card className="relative col-span-full flex h-[32rem] flex-col border-0 shadow-none xl:col-span-4">
			<CardHeader
				className="h-[5.25rem] shrink-0 border-b"
				orientation="horizontal"
			>
				<CardTitle>دست‌نویس</CardTitle>
				<CardNav>
					<Button
						variant="outline"
						className="group cursor-pointer"
						onClick={() => setIsShow(!isShow)}
					>
						{isShow ? <FaEyeSlash /> : <FaEye />}
						<p className="hidden group-hover:block">
							{isShow ? "مخفی کردن" : "نمایش بده"}
						</p>
					</Button>
				</CardNav>
			</CardHeader>
			<CardContent
				className={cn(
					"grow overflow-y-scroll p-6",
					!isShow &&
						"pointer-events-none cursor-not-allowed select-none blur-sm",
				)}
			>
				<NotesList
					items={items}
					onStatusChange={handleStatusChange}
					onDelete={handleDelete}
				/>
			</CardContent>
			<CardFooter
				className={cn(
					"min-h-32 w-full shrink-0 border-t p-6",
					!isShow &&
						"pointer-events-none cursor-not-allowed select-none blur-sm",
				)}
			>
				<NoteCreateForm onSubmit={handleSubmit} />
			</CardFooter>
		</Card>
	);
}

function NotesList({
	items,
	onStatusChange,
	onDelete,
}: {
	items: Note[] | null;
	onStatusChange: (index: number, status: NoteStatus) => void;
	onDelete: (index: number) => void;
}) {
	if (!items) {
		return <></>;
	}

	return (
		<>
			<Accordion className="space-y-3" type="multiple">
				{items?.map((item: any, index: number) => (
					<AccordionItem
						key={index}
						className="group rounded-xl border"
						value={index.toString()}
					>
						<AccordionPrimitive.Header asChild>
							<div className="flex items-start gap-3 p-4">
								<div className="flex h-5 items-center">
									<Checkbox
										onCheckedChange={(checked) =>
											onStatusChange(
												index,
												checked ? NoteStatus.Completed : NoteStatus.Active,
											)
										}
									/>
								</div>

								<AccordionPrimitive.Trigger asChild>
									<div className="grow cursor-pointer">{item.title}</div>
								</AccordionPrimitive.Trigger>

								<div className="ms-auto flex h-5 items-center gap-3">
									<div
										className={cn(
											"size-3 rounded-sm",
											item.priority === "low" &&
												"border-bg-green-500 bg-green-500",
											item.priority === "medium" &&
												"border-bg-yellow-500 bg-yellow-500",
											item.priority === "high" &&
												"border-bg-red-500 bg-red-500",
										)}
									></div>

									<div
										className="cursor-pointer"
										onClick={() => onDelete(index)}
									>
										<FaTrash />
									</div>

									<AccordionPrimitive.Trigger className="transition duration-300 group-data-[state='open']:rotate-180">
										<FaChevronDown />
									</AccordionPrimitive.Trigger>
								</div>
							</div>
						</AccordionPrimitive.Header>
						<AccordionContent className="p-4 pt-0">
							{item.description}
						</AccordionContent>
					</AccordionItem>
				))}
			</Accordion>
		</>
	);
}

const noteCreateSchema = z.object({
	title: z.string(),
	description: z.string(),
	priority: z.custom<NotePriority>().nullable(),
});

type NoteCreateSchema = z.infer<typeof noteCreateSchema>;

const notePriorityOptions: SelectItemType<NotePriority>[] = [
	{ value: NotePriority.Low, label: "bg-green-500" },
	{ value: NotePriority.Medium, label: "bg-yellow-500" },
	{ value: NotePriority.High, label: "bg-red-500" },
];

function NoteCreateForm({
	onSubmit,
}: {
	onSubmit: (note: Pick<Note, "title" | "description" | "priority">) => void;
}) {
	const form = useForm<NoteCreateSchema>({
		defaultValues: {
			title: "",
			description: "",
			priority: null,
		},
	});

	const {
		control,
		formState: { isSubmitSuccessful },
		handleSubmit: handleRhfSubmit,
		reset,
	} = form;

	function handleSubmit(values: NoteCreateSchema) {
		onSubmit(values);
	}

	useEffect(() => {
		if (isSubmitSuccessful) {
			reset({
				title: "",
				description: "",
				priority: null,
			});
		}
	}, [isSubmitSuccessful, reset]);

	return (
		<Form {...form}>
			<form
				className="w-full space-y-2"
				onSubmit={handleRhfSubmit(handleSubmit)}
			>
				<FormField
					control={control}
					name="title"
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Input placeholder="عنوان" {...field} />
							</FormControl>
						</FormItem>
					)}
				/>

				<FormField
					control={control}
					name="description"
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Textarea placeholder="توضیحات" {...field} />
							</FormControl>
						</FormItem>
					)}
				/>

				<div className="flex items-center justify-between gap-3">
					<FormField
						control={control}
						name="priority"
						render={({ field }) => (
							<div className="flex gap-2">
								<div
									className={cn(
										"flex size-4 cursor-pointer items-center justify-center rounded-sm border border-gray-300 text-[0.5rem] text-gray-500 opacity-40 transition duration-200 hover:opacity-70",
										field.value === null && "!opacity-100",
									)}
									onClick={() => field.onChange(null)}
								>
									<FaX />
								</div>

								{notePriorityOptions.map((priority) => (
									<div
										key={priority.value}
										className={cn(
											"size-4 cursor-pointer rounded-sm opacity-30 transition duration-200 hover:opacity-80",
											priority.label,
											field.value === priority.value && "!opacity-100",
										)}
										onClick={() => field.onChange(priority.value)}
									></div>
								))}
							</div>
						)}
					/>

					<Button
						className="w-32 rounded-xl border !shadow-none"
						variant="default"
					>
						افزودن
					</Button>
				</div>
			</form>
		</Form>
	);
}

export { NotesWidget };
