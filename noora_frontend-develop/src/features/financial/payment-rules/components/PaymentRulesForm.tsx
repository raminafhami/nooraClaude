import { useEffect, useRef, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";

import { BuyerLookup } from "@/buyers/models/BuyerLookup";
import { getBuyers } from "@/buyers/services/getBuyers";
import { searchBuyerName } from "@/buyers/utils/searchBuyerName";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/form/FieldError";
import { Input } from "@/form/Input";
import { messages } from "@/messages";
import Autocomplete from "@/ui/Autocomplete/Autocomplete";
import { Head } from "@/ui/Head";
import { Loading } from "@/ui/Loader";
import { PriceInput } from "@/ui/MaskInput/PriceInput";
import Select from "@/ui/Select/Select";
import { compareById } from "@/utils";

import { PaymentRule } from "../models/PaymentRule";
import {
	PaymentRuleMethod,
	paymentRuleMethods,
} from "../models/PaymentRuleMethod";
import { PaymentRuleType, paymentRuleTypes } from "../models/PeymentRuleType";
import { createPaymentRule } from "../services/createPaymentRule";
import { updatePaymentRule } from "../services/updatePaymentRule";
import {
	PaymentRuleCaseItem,
	PaymentRuleCaseItemKey,
} from "./PaymentRuleCaseItem";
import PaymentRulesCasesForm from "./PaymentRulesCasesForm";

interface Props {
	userId: string;
	service: string;
	conditions: Partial<{ [key in PaymentRuleCaseItemKey]: boolean }>;
	rule: PaymentRule | null;
	onAdd: (rule: PaymentRule) => void;
	onEditCancel: () => void;
	onUpdate: (rule: PaymentRule) => void;
}

interface FormData {
	name: string;
	buyer: BuyerLookup | null;
	type: PaymentRuleType;
	method: PaymentRuleMethod;
	amount: string;
	cases: PaymentRuleCaseItem[];
}

function getDefaultValues(rule: PaymentRule | null): FormData {
	const defaultValues: FormData = {
		name: rule?.name ?? "",
		buyer: rule?.buyer ?? null,
		type: rule?.type ?? (null as any),
		method: rule?.method ?? (null as any),
		amount: rule?.amount.toString() ?? "",
		cases: rule?.cases ?? [],
	};

	return defaultValues;
}

function PaymentRulesForm({
	userId,
	service,
	conditions,
	rule,
	onAdd,
	onEditCancel,
	onUpdate,
}: Props) {
	const [isLoading, setIsLoading] = useState<boolean>(true);

	const [buyers, setBuyers] = useState<BuyerLookup[]>([]);
	const buyerSearchTimeout = useRef<NodeJS.Timeout>();
	async function loadBuyers(value: string) {
		clearTimeout(buyerSearchTimeout.current);
		await new Promise((resolve) => {
			buyerSearchTimeout.current = setTimeout(async () => {
				if (value) {
					const buyers = await getBuyers({
						filters: {
							...searchBuyerName(value),
						},
					});
					setBuyers(buyers);
				} else {
					setBuyers([]);
				}
				resolve(null);
			}, 500);
		});
	}

	const form = useForm<FormData>({
		defaultValues: getDefaultValues(rule),
	});

	const {
		control,
		formState,
		handleSubmit: onSubmit,
		reset,
		setError,
		watch,
	} = form;

	const { isDirty, isSubmitting, isSubmitSuccessful } = formState;

	const { type } = watch();

	async function handleSubmit(values: FormData) {
		try {
			if (!rule) {
				const createdRule = await createPaymentRule({
					userId,
					service,
					name: values.name,
					buyerId: values.buyer?.id ?? null,
					type: values.type,
					method: values.method,
					amount: parseFloat(values.amount),
					cases: values.cases,
				});

				onAdd(createdRule);
			} else {
				const updatedRule = await updatePaymentRule(rule.id, {
					name: values.name,
					buyerId: values.buyer?.id ?? null,
					type: values.type,
					method: values.method,
					amount: parseFloat(values.amount),
					cases: values.cases,
				});

				onUpdate(updatedRule);
			}
		} catch (err: any) {
			console.error(err);
			setError("root.server", {
				message: err?.message || "Something went wrong...",
			});
		}
	}

	useEffect(() => {
		(async () => {
			try {
				setIsLoading(true);

				if (rule?.buyerId) {
					const buyers = await getBuyers({
						filters: { _id: rule.buyerId },
					});

					setBuyers(buyers);
				}
			} catch (err: any) {
				console.error(err);
			} finally {
				setIsLoading(false);
			}
		})();
	}, [rule?.buyerId]);

	useEffect(() => {
		if (isSubmitSuccessful) {
			if (rule) {
				toast.success("قانون پرداخت مورد نظر با موفقیت بروزرسانی گردید.");
			} else {
				toast.success("قانون پرداخت مورد نظر با موفقیت ایجاد گردید.");
			}

			onEditCancel();
			reset(getDefaultValues(null));
		}
	}, [isSubmitSuccessful, onEditCancel, reset, rule]);

	useEffect(() => {
		reset(getDefaultValues(rule));
	}, [reset, rule]);

	return (
		<div className="space-y-8">
			<Head.Root>
				<Head.Title>
					{!rule ? "افزودن قانون پرداخت" : `ویرایش قانون پرداخت: ${rule.name}`}
				</Head.Title>
			</Head.Root>

			{isLoading ? (
				<Loading size="sm">در حال دریافت اطلاعات...</Loading>
			) : (
				<FormProvider {...form}>
					<form onSubmit={onSubmit(handleSubmit)}>
						<div className="space-y-4">
							<div className="col-span-2 col-start-1 flex gap-x-4">
								<label className="shrink-0 basis-24 pt-2" htmlFor="name">
									نام قرارداد:
								</label>
								<div className="grow">
									<Controller
										control={control}
										name="name"
										render={({ field, fieldState }) => (
											<>
												<Input {...field} />
												<FieldError error={fieldState.error} />
											</>
										)}
										rules={{ required: messages.validation.required }}
									/>
								</div>
							</div>

							{conditions.buyer && (
								<div className="col-span-2 col-start-1 flex gap-x-4">
									<label className="shrink-0 basis-24 pt-2" htmlFor="buyer">
										خریدار:
									</label>
									<div className="grow">
										<Controller
											control={control}
											name="buyer"
											render={({ field, fieldState }) => (
												<>
													<Autocomplete<BuyerLookup>
														compareFn={compareById}
														id={field.name}
														items={buyers}
														label={(x) => x.name}
														onInput={loadBuyers}
														{...field}
													/>
													<FieldError error={fieldState.error} />
												</>
											)}
											rules={{}}
										/>
									</div>
								</div>
							)}

							<div className="col-span-2 col-start-1 flex gap-x-4">
								<label className="shrink-0 basis-24 pt-2" htmlFor="type">
									نوع پرداخت:
								</label>
								<div className="grow">
									<Controller
										control={control}
										name="type"
										render={({ field, fieldState }) => (
											<>
												<Select<PaymentRuleType>
													items={paymentRuleTypes}
													{...field}
												/>
												<FieldError error={fieldState.error} />
											</>
										)}
										rules={{ required: messages.validation.required }}
									/>
								</div>
							</div>

							<div className="col-span-2 col-start-1 flex gap-x-4">
								<label className="shrink-0 basis-24 pt-2" htmlFor="method">
									نحوه محاسبه:
								</label>
								<div className="grow">
									<Controller
										control={control}
										name="method"
										render={({ field, fieldState }) => (
											<>
												<Select items={paymentRuleMethods} {...field} />
												<FieldError error={fieldState.error} />
											</>
										)}
										rules={{ required: messages.validation.required }}
									/>
								</div>
							</div>

							<div className="col-span-2 col-start-1 flex gap-x-4">
								<label className="shrink-0 basis-24 pt-2" htmlFor="amount">
									{`مقدار (${
										type === PaymentRuleType.Percentage ? "درصد" : "ریال"
									}):`}
								</label>
								<div className="grow">
									<Controller
										control={control}
										name="amount"
										render={({ field, fieldState }) => (
											<>
												<PriceInput
													className="text-right"
													dir="ltr"
													id={field.name}
													{...field}
												/>
												<FieldError error={fieldState.error} />
											</>
										)}
										rules={{ required: messages.validation.required }}
									/>
								</div>
							</div>

							<PaymentRulesCasesForm conditions={conditions} />

							<div className="flex gap-x-2">
								<Button disabled={!isDirty || isSubmitting}>
									{isSubmitting ? (
										<Loading
											horizontalPlacement="center"
											intent="white"
											size="sm"
										/>
									) : !rule ? (
										"افزودن قانون پرداخت"
									) : (
										"بروزرسانی قانون پرداخت"
									)}
								</Button>

								{rule && (
									<Button
										type="button"
										variant="link"
										onClick={() => {
											onEditCancel();
										}}
									>
										انصراف
									</Button>
								)}
							</div>
						</div>
					</form>
				</FormProvider>
			)}
		</div>
	);
}

export default PaymentRulesForm;
