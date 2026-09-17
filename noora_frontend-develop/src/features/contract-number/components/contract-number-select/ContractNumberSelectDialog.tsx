"use client";

import { LucideFilePlus2, LucideFolderSearch } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { BuyerApi } from "@/buyers/models/BuyerApi";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { DialogProps, useDialogs } from "@/components/ui/dialog/use-dialogs";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Numeric } from "@/components/ui/numeric";
import { Spinner } from "@/components/ui/spinner";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { UserLookupApiSelect } from "@/identity/users/components/UserLookupApiSelect";
import { UserLookupApi } from "@/identity/users/models/UserLookup";
import { getUserFullname } from "@/identity/users/utils/getUserFullname";
import { cn } from "@/lib/utils";
import { messages } from "@/messages";
import { asNavigationProp } from "@/utils/asNavigationProp";
import { zodResolver } from "@hookform/resolvers/zod";

import { ContractNumber } from "../../models/ContractNumber";
import { ContractNumberQueryFilter } from "../../models/ContractNumberQuery";
import { getContractNumbers } from "../../services/getContractNumbers";
import { ContractNumberUpsertDialog } from "../contract-number-upsert/ContractNumberUpsertDialog";
import { BuyerSelect } from "./BuyerSelect";

const formSchema = z.object({
	buyer: z.custom<BuyerApi>(Boolean, messages.validation.required),
	customer: z.custom<UserLookupApi>().optional(),
	proforma: z.string(),
});

type FormSchema = z.infer<typeof formSchema>;

function ContractNumberSelectDialog({
	payload,
	open,
	onClose,
}: DialogProps<
	Partial<{ buyer: BuyerApi; customer: UserLookupApi }> | undefined,
	ContractNumber | undefined
>) {
	const dialogs = useDialogs();

	const { identity } = useLoggedInUser();

	const [isPending, setIsPending] = useState<boolean>(false);

	const [contractNumbers, setContractNumbers] = useState<ContractNumber[]>();
	const [selectedContractNumber, setSelectedContractNumber] =
		useState<ContractNumber>();

	const form = useForm<FormSchema>({
		defaultValues: {
			buyer: payload?.buyer ?? undefined,
			customer: payload?.customer ?? undefined,
			proforma: "",
		},
		resolver: zodResolver(formSchema),
	});

	const {
		control,
		formState: { isSubmitting },
		watch,
	} = form;

	const fields = watch();

	async function handleSearch(values: FormSchema) {
		try {
			setSelectedContractNumber(undefined);

			const filters: ContractNumberQueryFilter = {
				buyerId: values.buyer.id,
				customerId: values.customer?.id ?? undefined,
				proforma: values.proforma.trim() || undefined,
			};

			if (identity.branchId) {
				filters.branchId = identity.branchId;
			}

			const contractNumbers = await getContractNumbers({
				filters,
				populate: ["branchId", "buyerId", "customerId"],
			});

			setContractNumbers(contractNumbers);
		} catch (err: any) {
			console.error(err);
			toast.error(
				err?.message || "خطای نامشخصی در هنگام دریافت اطلاعات رخ داد.",
			);

			setContractNumbers(undefined);
		}
	}

	function handleSubmit(contractNumber?: ContractNumber) {
		onClose(contractNumber ?? selectedContractNumber);
	}

	return (
		<Dialog open={open} onOpenChange={onClose.bind(null, undefined)}>
			<DialogContent className="max-w-screen-lg" aria-describedby={undefined}>
				<DialogHeader>
					<DialogTitle>انتخاب قرارداد</DialogTitle>
				</DialogHeader>
				<div className="grid grid-cols-1 gap-10">
					<Form {...form}>
						<form
							className="space-y-6"
							onSubmit={form.handleSubmit(handleSearch)}
						>
							<fieldset
								className="flex flex-1 flex-col gap-4 sm:flex-row"
								disabled={isSubmitting || !!contractNumbers || isPending}
							>
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
														!!payload?.buyer ||
														isSubmitting ||
														!!contractNumbers ||
														isPending
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
														isSubmitting || !!contractNumbers || isPending
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
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</fieldset>

							{!contractNumbers && (
								<div className="flex xs:flex-row-reverse">
									<Button
										className="w-full xs:w-32"
										disabled={isSubmitting || isPending}
										type="submit"
										variant="secondary"
									>
										<Spinner loading={isSubmitting || isPending} size="sm">
											جستجو
										</Spinner>
									</Button>
								</div>
							)}
						</form>
					</Form>

					{contractNumbers && (
						<div className="space-y-6">
							<Table
								loading={isPending}
								slotProps={{
									wrapper: { className: "-mx-6 overflow-hidden" },
									root: { className: "rounded-none border-x-0" },
								}}
							>
								<TableHeader>
									<TableRow className="whitespace-nowrap">
										<TableHead className="w-32">شماره قرارداد</TableHead>
										<TableHead>عنوان</TableHead>
										{!identity.branchId && (
											<TableHead className="w-36">شعبه</TableHead>
										)}
										<TableHead className="w-64">خریدار</TableHead>
										<TableHead className="w-64">مشتری</TableHead>
										<TableHead className="w-44">شماره پروفرما</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{contractNumbers.map((contractNumber) => {
										const isSelected =
											selectedContractNumber?.id === contractNumber.id;

										return (
											<TableRow
												key={contractNumber.id}
												className={cn("cursor-pointer whitespace-nowrap")}
												data-state={isSelected ? "selected" : undefined}
												onClick={() =>
													setSelectedContractNumber(contractNumber)
												}
												onDoubleClick={() => {
													handleSubmit(contractNumber);
												}}
											>
												<TableCell>
													<Numeric value={contractNumber.cn} />
												</TableCell>

												<TableCell>
													<div className="md:min-w-32">
														{contractNumber.title}
													</div>
												</TableCell>

												{!identity.branchId && (
													<TableCell>
														{asNavigationProp(contractNumber.branchId)?.title ||
															"-"}
													</TableCell>
												)}

												<TableCell>
													{asNavigationProp(contractNumber.buyerId).name}
												</TableCell>

												<TableCell>
													{getUserFullname(
														asNavigationProp(contractNumber.customerId),
													) || "-"}
												</TableCell>

												<TableCell>{contractNumber.proforma || "-"}</TableCell>
											</TableRow>
										);
									})}

									<TableRow data-static>
										<TableCell colSpan={100}>
											<div className="flex h-full items-center">
												<Button
													type="button"
													variant="link"
													onClick={async () => {
														try {
															setIsPending(true);

															const createdContractNumber = await dialogs.open(
																ContractNumberUpsertDialog,
																{
																	title: [
																		fields.buyer.name,
																		getUserFullname(fields.customer),
																		fields.proforma,
																	]
																		.map((x) => x?.trim())
																		.filter(Boolean)
																		.join(" - "),
																	buyerId: fields.buyer,
																	customerId: fields.customer,
																	proforma: fields.proforma,
																},
															);

															if (!createdContractNumber) return;

															handleSubmit(createdContractNumber);
														} catch (err) {
															console.error(err);
														} finally {
															setIsPending(false);
														}
													}}
												>
													<LucideFilePlus2 size={16} />
													<span>ایجاد قرارداد جدید</span>
												</Button>
											</div>
										</TableCell>
									</TableRow>
								</TableBody>
							</Table>

							<div className="flex flex-col justify-between xs:flex-row-reverse">
								<Button
									className="w-full xs:w-24"
									disabled={!selectedContractNumber}
									type="button"
									variant="primary"
									onClick={() => {
										handleSubmit(selectedContractNumber);
									}}
								>
									ثبت
								</Button>

								<Button
									type="button"
									variant="outline"
									onClick={() => {
										setContractNumbers(undefined);
									}}
								>
									<LucideFolderSearch size={16} />
									<span>بازگشت به جستجو</span>
								</Button>
							</div>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}

export { ContractNumberSelectDialog };
