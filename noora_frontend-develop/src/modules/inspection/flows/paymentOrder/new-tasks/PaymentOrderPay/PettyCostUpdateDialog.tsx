"use client";

import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
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
import { MaskInput } from "@/components/ui/mask-input";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { currency as currencies, Currency } from "@/enums/Currency";
import { usePettyCategoryGroups } from "@/financial/petty-category/hooks/usePettyCategoryGroups";
import { PettyCostApi } from "@/financial/petty-cost/models/PettyCost";
import { updateUnofficialPettyCost } from "@/financial/petty-cost/services/updateUnofficialPettyCost";
import { messages } from "@/messages";
import { asNavigationProp } from "@/utils/asNavigationProp";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
	currencyRate: z.string().min(1, messages.validation.required),
	categoryId: z.string().min(1, messages.validation.required),
});

type FormSchema = z.infer<typeof formSchema>;

const PettyCostUpdateDialog = ({
	payload: cost,
	open,
	onClose,
}: DialogProps<PettyCostApi, boolean | undefined>) => {
	const form = useForm<FormSchema>({
		defaultValues: {
			currencyRate: cost.currencyRate.toString(),
			categoryId: asNavigationProp(cost.categoryId)?.id ?? "",
		},
		resolver: zodResolver(formSchema),
	});

	const {
		control,
		formState: { errors, isSubmitting, isSubmitSuccessful },
		setError,
	} = form;

	async function handleSubmit(values: FormSchema) {
		try {
			await updateUnofficialPettyCost(cost.id, {
				currencyRate:
					cost.currency !== Currency.Rial
						? parseInt(values.currencyRate)
						: undefined,
				categoryId: values.categoryId,
			});

			onClose(true);
		} catch (err) {
			console.error(err);
			setError("root", { message: "خطای نامشخصی در هنگام ثبت هزینه رخ داد." });
		}
	}

	const { pettyCategoryGroups, isLoadingCategories } = usePettyCategoryGroups({
		onError: () => {
			toast.error("خطای نامشخصی در هنگام دریافت فهرست مراکز بودجه رخ داد.");
		},
	});

	return (
		<Dialog open={open} onOpenChange={onClose.bind(null, undefined)}>
			<DialogContent className="max-w-screen-xs" aria-describedby={undefined}>
				<DialogHeader>
					<DialogTitle>ویرایش هزینه</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<Spinner loading={isLoadingCategories}>
						<form
							className="space-y-8"
							onSubmit={form.handleSubmit(handleSubmit)}
						>
							<fieldset
								className="grid grid-cols-12 gap-6"
								disabled={isSubmitting || isSubmitSuccessful}
							>
								{cost.currency !== Currency.Rial && (
									<>
										<FormItem className="col-span-full xs:col-span-6">
											<FormLabel>نوع ارز</FormLabel>
											<FormControl>
												<Input
													disabled
													value={currencies[cost.currency].title}
												/>
											</FormControl>
										</FormItem>

										<FormField
											control={control}
											name="currencyRate"
											render={({ field: { ref, onChange, ...field } }) => (
												<FormItem className="col-span-full xs:col-span-6">
													<FormLabel>
														نرخ ارز<span className="text-red-600"> *</span>
													</FormLabel>
													<FormControl>
														<MaskInput
															className="tracking-wider rtl:text-right"
															dir="ltr"
															inputRef={ref}
															mapToRadix={["."]}
															mask={Number}
															radix="."
															scale={2}
															thousandsSeparator=","
															unmask
															onAccept={(value) => onChange(value)}
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</>
								)}

								<FormField
									control={control}
									name="categoryId"
									render={({ field: { ref, onChange, ...field } }) => (
										<FormItem className="col-span-full">
											<FormLabel>
												مرکز هزینه<span className="text-red-600"> *</span>
											</FormLabel>
											<FormControl>
												<Select onValueChange={onChange} {...field}>
													<SelectTrigger ref={ref}>
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														{pettyCategoryGroups?.map((group) => (
															<>
																<SelectGroup>
																	<SelectLabel>
																		{group.budgetCategory.title}
																	</SelectLabel>
																</SelectGroup>
																{group.costCategories.map((item) => (
																	<SelectItem key={item.id} value={item.id}>
																		{item.title}
																	</SelectItem>
																))}
															</>
														))}
													</SelectContent>
												</Select>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
									rules={{ required: messages.validation.required }}
								/>
							</fieldset>

							{errors.root && (
								<DestructiveAlert>
									<AlertDescription>{errors.root.message}</AlertDescription>
								</DestructiveAlert>
							)}

							<div className="flex flex-col gap-3 xs:flex-row-reverse">
								<Button className="min-w-24" variant="primary">
									بروزرسانی
								</Button>
							</div>
						</form>
					</Spinner>
				</Form>
			</DialogContent>
		</Dialog>
	);
};

export default PettyCostUpdateDialog;
