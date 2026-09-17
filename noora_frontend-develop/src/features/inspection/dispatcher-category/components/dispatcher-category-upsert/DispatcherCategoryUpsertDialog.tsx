"use client";

import { useForm } from "react-hook-form";
import { FaPlus, FaX } from "react-icons/fa6";
import { toast } from "sonner";
import { z } from "zod";

import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { DialogProps } from "@/components/ui/dialog/use-dialogs";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { messages } from "@/messages";
import { zodResolver } from "@hookform/resolvers/zod";

import {
	DispatcherCategoryType,
	dispatcherCategoryTypeOptions,
} from "../../enums/DispatcherCategoryType";
import { DispatcherCategory } from "../../models/DispatcherCategory";
import { createDispatcherCategory } from "../../services/createDispatcherCategory";
import { updateDispatcherCategory } from "../../services/updateDispatcherCategory";
import { addCaretSymbol } from "../../utils/addCaretSymbol";
import { stripCaretSymbol } from "../../utils/stripCaretSymbol";

const formSchema = z.object({
	type: z.custom<DispatcherCategoryType>(Boolean, messages.validation.required),
	domainCode: z.string().min(1, messages.validation.required),
	inspectionDomain: z.string().min(1, messages.validation.required),
	scopes: z
		.custom<{ include: string; excludes: string[] }[]>()
		.refine(
			(value) => value.some((x) => x.include),
			messages.validation.required,
		),
});

type FormSchema = z.infer<typeof formSchema>;

function DispatcherCategoryUpsertDialog({
	payload: { category } = {},
	open,
	onClose,
}: DialogProps<
	{ category?: DispatcherCategory },
	DispatcherCategory | undefined
>) {
	const form = useForm<FormSchema>({
		defaultValues: {
			type: category?.type ?? undefined,
			domainCode: category?.domainCode ?? "",
			inspectionDomain: category?.inspectionDomain ?? "",
			scopes: (() => {
				if (!category?.include) {
					return [{ include: "", excludes: [] }];
				}

				return category.include.map((x) => ({
					include: stripCaretSymbol(x),
					excludes: category.exclude
						.filter((y) => y.startsWith(x))
						.map(stripCaretSymbol),
				}));
			})(),
		},
		resolver: zodResolver(formSchema),
	});

	const {
		control,
		formState: { errors, isDirty, isSubmitting, isSubmitSuccessful },
		setError,
	} = form;

	async function handleSubmit(values: FormSchema) {
		try {
			let upsertedCategory: DispatcherCategory;

			const { scopes, ...valuesRest } = values;

			let include: string[] = [];
			let exclude: string[] = [];

			scopes.forEach((scope) => {
				if (scope.include) {
					include.push(addCaretSymbol(scope.include));
					exclude.push(
						...scope.excludes
							.filter((x) => x !== scope.include)
							.map(addCaretSymbol),
					);
				}
			});

			include = Array.from(new Set(include));
			exclude = Array.from(new Set(exclude));

			if (!category?._id) {
				upsertedCategory = await createDispatcherCategory({
					...valuesRest,
					include,
					exclude,
				});

				toast.success("گروه کالایی مورد نظر با موفقیت افزوده شد.");
			} else {
				upsertedCategory = await updateDispatcherCategory(category._id, {
					...valuesRest,
					include,
					exclude,
				});

				toast.success("گروه کالایی مورد نظر با موفقیت بروزرسانی شد.");
			}

			onClose(upsertedCategory);
		} catch {
			setError("root.server", {
				message: "خطای نامشخصی در هنگام ثبت اطلاعات رخ داد.",
			});
		}
	}

	return (
		<Dialog open={open} onOpenChange={onClose.bind(null, undefined)}>
			<DialogContent
				aria-describedby={undefined}
				className="max-w-screen-xs"
				onInteractOutside={(event) => {
					if (isDirty) {
						event.preventDefault();
					}
				}}
			>
				<DialogHeader>
					<DialogTitle>
						{!category?._id ? "افزودن گروه کالایی جدید" : "ویرایش گروه کالایی"}
					</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmit)}>
						<fieldset
							className="space-y-6"
							disabled={isSubmitting || isSubmitSuccessful}
						>
							<div className="grid gap-6">
								<FormField
									control={control}
									name="type"
									render={({ field: { ref, value, onChange, ...field } }) => (
										<FormItem>
											<FormLabel>دسته بندی</FormLabel>
											<FormControl>
												<Select
													value={value ?? ""}
													onValueChange={onChange}
													{...field}
												>
													<SelectTrigger ref={ref}>
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														{dispatcherCategoryTypeOptions.map((item) => (
															<SelectItem key={item.value} value={item.value}>
																{item.label}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<Separator className="h-0.5" />

								<FormField
									control={control}
									name="domainCode"
									render={({ field }) => (
										<FormItem>
											<FormLabel>کد دامنه</FormLabel>
											<FormControl>
												<Input
													className="tracking-wider rtl:text-right"
													dir="ltr"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={control}
									name="inspectionDomain"
									render={({ field }) => (
										<FormItem>
											<FormLabel>دامنه بازرسی</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<Separator className="h-0.5" />

								<FormField
									control={control}
									name="scopes"
									render={({ field }) => (
										<FormItem onBlur={field.onBlur}>
											<FormLabel className="flex items-center gap-3">
												<span>محدوده بازرسی</span>
												<button
													className="flex size-6 items-center justify-center rounded-lg bg-gray-100"
													type="button"
													onClick={() => {
														const nextValues = [
															...field.value,
															{ include: "", excludes: [] },
														];

														field.onChange(nextValues);
													}}
												>
													<FaPlus size={12} />
												</button>
											</FormLabel>

											<div className="space-y-3">
												{field.value.map(({ include, excludes }, index) => {
													const addExcludeButton = (
														<button
															className="flex size-6 items-center justify-center rounded-lg bg-gray-100"
															type="button"
															onClick={() => {
																const nextValues = [...field.value];

																nextValues[index].excludes.push(include);

																field.onChange(nextValues);
															}}
														>
															<FaPlus size={12} />
														</button>
													);

													return (
														<div key={index} className="flex w-full gap-3">
															<div className="w-6 shrink-0 py-3">
																{index + 1}.
															</div>

															<div className="grow space-y-2 rounded-xl border px-3 py-2 text-xs">
																<div className="flex flex-wrap gap-2">
																	<div className="shrink-0 leading-6">کد</div>

																	<input
																		className={cn(
																			"h-6 w-fit min-w-8 shrink-0 rounded-lg !border-none py-0 text-center tracking-widest !shadow-none !outline-none transition-all duration-500",
																			!include && "bg-gray-100",
																			include.length <= 2 && "max-w-8",
																			include.length <= 4 &&
																				include.length > 2 &&
																				"max-w-12",
																			include.length > 4 && "max-w-16",
																		)}
																		dir="ltr"
																		disabled={!!excludes.length}
																		maxLength={8}
																		value={include}
																		onChange={(event) => {
																			const value = event.target.value;

																			const nextValues = [...field.value];
																			nextValues[index].include = value;

																			field.onChange(nextValues);
																		}}
																	/>

																	{!!include && (
																		<>
																			<div className="shrink-0 leading-6">
																				به استثنای:
																			</div>

																			{!excludes.length && addExcludeButton}
																		</>
																	)}
																</div>

																{!!include && !!excludes.length && (
																	<div className="flex flex-wrap gap-2">
																		{excludes.map((exclude, excludeIndex) => (
																			<div
																				key={excludeIndex}
																				className="flex h-6 items-center justify-center gap-2 rounded-lg bg-gray-100 px-2"
																			>
																				<span>کد</span>

																				<input
																					className={cn(
																						"h-6 w-fit min-w-8 max-w-20 !border-none bg-gray-200 py-0 text-center tracking-widest !shadow-none !outline-none transition-colors duration-500",
																						exclude.length === include.length &&
																							"bg-red-100 text-red-600",
																					)}
																					dir="ltr"
																					maxLength={8}
																					value={exclude}
																					onChange={(event) => {
																						const value =
																							event.target.value || include;

																						if (!value.startsWith(include)) {
																							return;
																						}

																						const nextValues = [...field.value];
																						nextValues[index].excludes[
																							excludeIndex
																						] = value;

																						field.onChange(nextValues);
																					}}
																				/>

																				<button
																					className="flex h-6 items-center justify-center rounded-lg bg-gray-100 !outline-none"
																					type="button"
																					onClick={() => {
																						const nextValues = [...field.value];

																						nextValues[index].excludes.splice(
																							excludeIndex,
																							1,
																						);

																						field.onChange(nextValues);
																					}}
																				>
																					<FaX size={10} />
																				</button>
																			</div>
																		))}

																		{addExcludeButton}
																	</div>
																)}
															</div>

															{field.value.length > 1 && (
																<div className="w-6 shrink-0 py-2">
																	<button
																		className="flex size-6 items-center justify-center rounded-lg bg-gray-100 !outline-none"
																		type="button"
																		onClick={() => {
																			const nextValues = [...field.value];

																			nextValues.splice(index, 1);

																			field.onChange(nextValues);
																		}}
																	>
																		<FaX size={10} />
																	</button>
																</div>
															)}
														</div>
													);
												})}
											</div>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							{errors.root?.server && (
								<DestructiveAlert>
									<AlertDescription>
										{errors.root.server.message}
									</AlertDescription>
								</DestructiveAlert>
							)}

							<DialogFooter>
								<Button className="min-w-24" type="submit" variant="primary">
									<Spinner loading={isSubmitting} size="sm">
										{!category?._id ? "افزودن" : "بروزرسانی"}
									</Spinner>
								</Button>

								<DialogTrigger asChild>
									<Button type="button" variant="ghost">
										بازگشت
									</Button>
								</DialogTrigger>
							</DialogFooter>
						</fieldset>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

export default DispatcherCategoryUpsertDialog;
