"use client";

import { useForm } from "react-hook-form";
import { FaTriangleExclamation } from "react-icons/fa6";
import { z } from "zod";

import { BuyerApi } from "@/buyers/models/BuyerApi";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Spinner } from "@/components/ui/spinner";
import { UserLookupApiSelect } from "@/identity/users/components/UserLookupApiSelect";
import { UserLookupApi } from "@/identity/users/models/UserLookup";
import { messages } from "@/messages";
import { asNavigationProp } from "@/utils/asNavigationProp";
import { zodResolver } from "@hookform/resolvers/zod";

import { ContractNumber } from "../../models/ContractNumber";
import { createContractNumber } from "../../services/createContractNumber";
import { updateContractNumber } from "../../services/updateContractNumebr";
import { BuyerSelect } from "./BuyerSelect";

const formSchema = z.object({
	title: z.string().min(1, messages.validation.required),
	buyer: z.custom<BuyerApi>(Boolean, messages.validation.required),
	customer: z.custom<UserLookupApi>().optional(),
	proforma: z.string(),
});

type FormSchema = z.infer<typeof formSchema>;

function ContractNumberUpsertDialog({
	payload,
	open,
	onClose,
}: DialogProps<
	Partial<ContractNumber> | undefined,
	ContractNumber | undefined
>) {
	const form = useForm<FormSchema>({
		defaultValues: {
			title: payload?.title || "",
			buyer: asNavigationProp(payload?.buyerId) ?? undefined,
			customer: asNavigationProp(payload?.customerId) ?? undefined,
			proforma: payload?.proforma || "",
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
			let upsertedContractNumber: ContractNumber;
			if (payload?.id) {
				upsertedContractNumber = await updateContractNumber(payload?.id, {
					title: values.title,
					buyerId: values.buyer.id,
					customerId: values.customer?.id,
					proforma: values.proforma,
				});
			} else {
				upsertedContractNumber = await createContractNumber({
					title: values.title,
					buyerId: values.buyer.id,
					customerId: values.customer?.id,
					proforma: values.proforma,
				});
			}

			const result: ContractNumber = {
				...upsertedContractNumber,
				buyerId: values.buyer,
				customerId: values.customer,
			};

			onClose(result);
		} catch (err: any) {
			console.error(err);
			setError("root.server", {
				message: err.message || "خطای نامشخصی در هنگام ثبت اطلاعات رخ داد.",
			});
		}
	}

	return (
		<Dialog open={open} onOpenChange={onClose.bind(null, undefined)}>
			<DialogContent className="max-w-screen-xs" aria-describedby={undefined}>
				<DialogHeader>
					<DialogTitle>
						{payload?.id ? "ویرایش قرارداد" : "افزودن قرارداد"}
					</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form
						className="space-y-6"
						onSubmit={form.handleSubmit(handleSubmit)}
					>
						{payload?.id && (
							<Alert variant="warn">
								<FaTriangleExclamation />
								<AlertDescription>
									توجه داشته باشید که در صورت وجود درخواست های بازرسی در
									قرارداد، اصلاح آن ها باید که به صورت دستی انجام شود.
								</AlertDescription>
							</Alert>
						)}

						<fieldset
							className="space-y-4"
							disabled={isSubmitting || isSubmitSuccessful}
						>
							<FormField
								control={control}
								name="title"
								render={({ field }) => (
									<FormItem className="grow basis-0">
										<FormLabel>عنوان</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={control}
								name="buyer"
								render={({ field }) => (
									<FormItem className="grow basis-0">
										<FormLabel>خریدار</FormLabel>
										<FormControl>
											<BuyerSelect
												{...field}
												disabled={
													(!payload?.id && !!payload?.buyerId) ||
													isSubmitting ||
													isSubmitSuccessful
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={control}
								name="customer"
								render={({ field }) => (
									<FormItem className="grow basis-0">
										<FormLabel>مشتری</FormLabel>
										<FormControl>
											<UserLookupApiSelect
												{...field}
												disabled={
													(!payload?.id && !!payload?.customerId) ||
													isSubmitting ||
													isSubmitSuccessful
												}
												mode="branchCustomerOrPersonnel"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={control}
								name="proforma"
								render={({ field }) => (
									<FormItem className="grow basis-0">
										<FormLabel>شماره پروفرما</FormLabel>
										<FormControl>
											<Input
												{...field}
												disabled={
													(!payload?.id && !!payload?.proforma) ||
													isSubmitting ||
													isSubmitSuccessful
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</fieldset>

						{errors.root?.server && (
							<DestructiveAlert>
								<AlertDescription>
									{errors.root.server.message}
								</AlertDescription>
							</DestructiveAlert>
						)}

						<div className="flex xs:flex-row-reverse">
							<Button
								className="w-full xs:w-24"
								disabled={isSubmitting || isSubmitSuccessful}
								type="submit"
								variant="primary"
							>
								<Spinner
									loading={isSubmitting || isSubmitSuccessful}
									color="white"
									size="sm"
								>
									{payload?.id ? "بروزرسانی" : "افزودن"}
								</Spinner>
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

export { ContractNumberUpsertDialog };
