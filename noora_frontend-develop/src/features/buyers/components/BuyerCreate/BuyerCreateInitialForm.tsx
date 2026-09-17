"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { BuyerType, buyerTypeOptions } from "@/buyers/enums/BuyerType";
import { Buyer } from "@/buyers/models/Buyer";
import { getBuyers } from "@/buyers/services/getBuyers";
import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { MaskInput } from "@/components/ui/mask-input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { messages } from "@/messages";
import { Loading } from "@/ui/Loader";
import { zodResolver } from "@hookform/resolvers/zod";

import { WidgetMode } from "./BuyerCreateWidget";

interface Props {
	onModeSwitch: (mode: WidgetMode, buyer: Buyer) => void;
	onClose: () => void;
}

const schema = z
	.object({
		type: z.custom<BuyerType>(Boolean, messages.validation.required),
		nationalCode: z.string().min(1, messages.validation.required),
	})
	.refine(
		({ type, nationalCode }) =>
			type === BuyerType.Natural ? nationalCode.length === 10 : true,
		{
			path: ["nationalCode"],
			message: "کد ملی 10 رقمی می باشد.",
		},
	)
	.refine(
		({ type, nationalCode }) =>
			type === BuyerType.Legal ? nationalCode.length === 11 : true,
		{
			path: ["nationalCode"],
			message: "شناسه ملی 11 رقمی می باشد.",
		},
	);

type FormData = z.infer<typeof schema>;

function BuyerCreateInitialForm({ onModeSwitch, onClose }: Props) {
	const { identity } = useLoggedInUser();

	const form = useForm<FormData>({
		defaultValues: {
			type: "" as BuyerType,
			nationalCode: "",
		},
		resolver: zodResolver(schema),
	});

	const {
		control,
		formState: { errors, isSubmitting, isSubmitSuccessful },
		handleSubmit: handleRhfSubmit,
		setError,
		watch,
	} = form;

	const { type } = watch();

	async function handleSubmit(values: FormData) {
		try {
			const buyer = await getBuyers({
				filters: {
					type: values.type,
					nationalCode: values.nationalCode,
				},
				populate: ["industryId", "subIndustryId"],
			}).then((buyers) => buyers.at(0));

			console.info({ buyer });

			if (!buyer) {
				onModeSwitch(WidgetMode.Create, { ...values } as Buyer);
			} else {
				const isBuyerInBranch =
					identity.branchId === null ||
					buyer.branchIds.some((x) => x === identity.branchId);

				if (isBuyerInBranch) {
					throw new Error("خریدار مورد نظر پیش از این تعریف شده است.");
				}

				onModeSwitch(WidgetMode.AddToBranch, { ...buyer });
			}
		} catch (err: any) {
			console.error(err);
			setError("root.server", {
				message: err?.message || "خطای نامشخصی در هنگام دریافت اطلاعات رخ داد.",
			});
		}
	}

	return (
		<Form {...form}>
			<form
				onSubmit={async (e) => {
					e.stopPropagation();
					await handleRhfSubmit(handleSubmit)(e);
				}}
			>
				<fieldset
					className="space-y-8"
					disabled={isSubmitting || isSubmitSuccessful}
				>
					<div className="grid grid-cols-12 gap-6">
						<FormField
							control={control}
							name="type"
							render={({ field }) => (
								<FormItem className="col-span-full !col-start-1 sm:col-span-6">
									<FormLabel>نوع:</FormLabel>
									<FormControl>
										<Select value={field.value} onValueChange={field.onChange}>
											<SelectTrigger ref={field.ref}>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{buyerTypeOptions.map((x) => (
													<SelectItem key={x.value} value={x.value}>
														{x.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={control}
							name="nationalCode"
							render={({ field: { ref, onChange, ...field } }) => (
								<FormItem className="col-span-full !col-start-1 sm:col-span-6">
									<FormLabel>
										{!type || type === BuyerType.Natural
											? "کد ملی"
											: "شناسه ملی"}
										:
									</FormLabel>
									<FormControl>
										<MaskInput
											className="text-right tracking-widest"
											dir="ltr"
											inputRef={ref}
											mask={
												!type || type === BuyerType.Natural
													? "0000000000"
													: "00000000000"
											}
											unmask
											onAccept={onChange}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					{errors.root?.server && (
						<DestructiveAlert>
							<AlertDescription>{errors.root.server.message}</AlertDescription>
						</DestructiveAlert>
					)}

					{!isSubmitSuccessful && (
						<div className="flex gap-3">
							<Button className="min-w-full xs:min-w-32" variant="secondary">
								بررسی
								{isSubmitting && <Loading size="xs" />}
							</Button>

							<Button
								className="w-full xs:w-auto"
								type="button"
								variant="ghost"
								onClick={onClose}
							>
								انصراف
							</Button>
						</div>
					)}
				</fieldset>
			</form>
		</Form>
	);
}

export { BuyerCreateInitialForm };
