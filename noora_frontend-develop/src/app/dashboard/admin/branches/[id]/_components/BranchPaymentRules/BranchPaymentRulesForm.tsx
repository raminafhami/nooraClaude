import { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { PaymentRule } from "@/financial/payment-rules/models/PaymentRule";
import {
	PaymentRuleMethod,
	paymentRuleMethods,
} from "@/financial/payment-rules/models/PaymentRuleMethod";
import { PaymentRuleStatus } from "@/financial/payment-rules/models/PaymentRuleStatus";
import {
	PaymentRuleType,
	paymentRuleTypes,
} from "@/financial/payment-rules/models/PeymentRuleType";
import { createPaymentRule } from "@/financial/payment-rules/services/createPaymentRule";
import { updatePaymentRule } from "@/financial/payment-rules/services/updatePaymentRule";
import { FieldError } from "@/form/FieldError";
import { Input } from "@/form/Input";
import { PriceInput } from "@/form/PriceInput";
import { Select } from "@/form/select";
import { messages } from "@/messages";
import { Head } from "@/ui/Head";
import { Loading } from "@/ui/Loader";

import { useBranchContext } from "../BranchContext";

interface Props {
	rule: PaymentRule | null;
	onRuleEditCancel: (rule: null) => void;
	onRuleUpdate: (rule: PaymentRule) => void;
}

interface FormData {
	name: string;
	type: PaymentRuleType;
	method: PaymentRuleMethod;
	amount: number;
}

export function BranchPaymentRulesForm({
	rule,
	onRuleEditCancel,
	onRuleUpdate,
}: Props): React.ReactNode {
	const { branch, paymentRules, onPaymentRulesUpdate } = useBranchContext();

	const [isFormSuccessful, setFormSuccessful] = useState<boolean>(false);

	const {
		control,
		formState,
		handleSubmit,
		register,
		reset,
		setError,
		setValue,
		watch,
	} = useForm<FormData>({
		mode: "onTouched",
	});
	const { errors, isDirty, isSubmitting, isSubmitSuccessful } = formState;
	const fields = watch();

	const handleFormReset = useCallback(
		(rule: PaymentRule | null): void => {
			const data = {
				name: rule?.name || "",
				type: rule?.type,
				method: rule?.method,
				amount: rule?.amount,
			};

			reset(data);
		},
		[reset],
	);

	useEffect(() => {
		setFormSuccessful(false);
	}, [rule?.id]);

	useEffect(() => {
		handleFormReset(rule);
	}, [isSubmitSuccessful, rule, handleFormReset]);

	return (
		<div className="space-y-8">
			<Head.Root>
				<Head.Title>
					{!rule ? "افزودن قانون پرداخت" : `ویرایش قانون پرداخت: ${rule.name}`}
				</Head.Title>
			</Head.Root>

			<form
				onSubmit={handleSubmit(async (values) => {
					setFormSuccessful(false);

					const { type, method, amount } = values;
					const name = values.name.trim();

					try {
						if (branch.managerId === null) {
							throw new Error();
						}

						if (!rule) {
							let activeRule = paymentRules.find(
								(x) => x.status === PaymentRuleStatus.Active,
							);
							if (activeRule) {
								activeRule = await updatePaymentRule(activeRule.id, {
									status: PaymentRuleStatus.Inactive,
								});
							}

							const createdRule = await createPaymentRule({
								userId: branch.managerId,
								buyerId: null,
								service: "agency",
								name: name,
								type: type,
								method: method,
								amount: amount,
								cases: [],
							});

							onPaymentRulesUpdate([
								createdRule,
								...paymentRules.map((x) =>
									x.id !== activeRule?.id ? x : activeRule,
								),
							]);
						} else {
							const updatedRule = await updatePaymentRule(rule.id, {
								name: name,
								type: type,
								method: method,
								amount: amount,
							});

							onPaymentRulesUpdate([
								...paymentRules.map((x) =>
									x.id !== updatedRule.id ? x : { ...x, ...updatedRule },
								),
							]);
							onRuleUpdate(updatedRule);
						}

						setFormSuccessful(true);
					} catch (err: any) {
						console.error(err);
						setError("root.server", {
							message: err?.message || "Something went wrong...",
						});
					}
				})}
			>
				<div className="space-y-4">
					{isFormSuccessful && (
						<Alert className="col-span-2 col-start-1 mb-4" variant="info">
							<AlertDescription>
								قانون پرداخت مورد نظر با موفقیت افزوده شد.
							</AlertDescription>
						</Alert>
					)}

					<div className="col-span-2 col-start-1 flex gap-x-4">
						<label className="shrink-0 basis-24 pt-2" htmlFor="name">
							نام قرارداد:
						</label>
						<div className="grow">
							<Input
								id="name"
								{...register("name", {
									required: messages.validation.required,
								})}
							/>
							<FieldError error={errors["name"]} />
						</div>
					</div>

					<div className="col-span-2 col-start-1 flex gap-x-4">
						<label className="shrink-0 basis-24 pt-2" htmlFor="type">
							نوع پرداخت:
						</label>
						<div className="grow">
							<Controller
								control={control}
								name="type"
								render={({
									field: { name, value, onBlur, onChange },
									fieldState: { error },
								}) => (
									<>
										<Select
											id={name}
											items={paymentRuleTypes}
											value={value}
											onLeave={onBlur}
											onMutate={(v) => {
												onChange(v || null);

												if (v === PaymentRuleType.Fixed) {
													setValue("method", PaymentRuleMethod.Total, {
														shouldDirty: true,
														shouldTouch: true,
														shouldValidate: true,
													});
												}
											}}
										/>
										<FieldError error={error} />
									</>
								)}
								rules={{ required: messages.validation.required }}
							/>
						</div>
					</div>

					<div className="col-span-2 col-start-1 flex gap-x-4">
						<label className="shrink-0 basis-24 pt-2" htmlFor="method">
							نوع محاسبه:
						</label>
						<div className="grow">
							<Controller
								control={control}
								name="method"
								render={({
									field: { name, value, onBlur, onChange },
									fieldState: { error },
								}) => (
									<>
										<Select
											disabled={fields["type"] === PaymentRuleType.Fixed}
											id={name}
											items={paymentRuleMethods}
											value={value}
											onLeave={onBlur}
											onMutate={(v) => onChange(v || null)}
										/>
										<FieldError error={error} />
									</>
								)}
								rules={{ required: messages.validation.required }}
							/>
						</div>
					</div>

					<div className="col-span-2 col-start-1 flex gap-x-4">
						<label className="shrink-0 basis-24 pt-2" htmlFor="amount">
							{`مقدار (${
								!fields["type"] || fields["type"] === PaymentRuleType.Fixed
									? "ریال"
									: "درصد"
							}):`}
						</label>
						<div className="grow">
							<Controller
								control={control}
								name="amount"
								render={({
									field: { name, value, onBlur, onChange },
									fieldState: { error },
								}) => (
									<>
										<PriceInput
											className="text-right"
											dir="ltr"
											id={name}
											value={value?.toString()}
											onBlur={onBlur}
											onMutate={(v) => onChange(parseFloat(v))}
										/>
										<FieldError error={error} />
									</>
								)}
								rules={{ required: messages.validation.required }}
							/>
						</div>
					</div>

					<div className="ms-28 flex gap-x-2">
						<Button disabled={!isDirty || isSubmitting} variant="primary">
							{!rule ? "افزودن" : "بروزرسانی"}
							{isSubmitting && <Loading intent="white" size="xs" />}
						</Button>

						{rule && (
							<Button
								type="button"
								variant="ghost"
								onClick={() => onRuleEditCancel(null)}
							>
								انصراف
							</Button>
						)}
					</div>
				</div>
			</form>
		</div>
	);
}
