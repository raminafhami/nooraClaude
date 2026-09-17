"use client";

import { useState } from "react";
import { FaEye, FaEyeSlash, FaPencil, FaRotate } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { Head } from "@/ui/Head";
import { Loading } from "@/ui/Loader";
import { Panel } from "@/ui/Panel";
import { Table } from "@/ui/Table";
import { toCurrency } from "@/utils/String";

import { PaymentRule } from "../models/PaymentRule";
import { paymentRuleMethod } from "../models/PaymentRuleMethod";
import {
	PaymentRuleStatus,
	paymentRuleStatus,
} from "../models/PaymentRuleStatus";
import { PaymentRuleType, paymentRuleType } from "../models/PeymentRuleType";
import { updatePaymentRule } from "../services/updatePaymentRule";
import { PaymentRuleCaseItemKey } from "./PaymentRuleCaseItem";
import PaymentRulesTableItemCases from "./PaymentRulesTableItemCases";

interface Props {
	loading: boolean;
	rules: PaymentRule[];
	conditions: Partial<{ [key in PaymentRuleCaseItemKey]: boolean }>;
	onEdit: (rule: PaymentRule) => void;
	onReload: () => void;
	onUpdate: (rule: PaymentRule) => void;
}

function PaymentRulesTable({
	loading,
	rules,
	conditions,
	onEdit,
	onReload,
	onUpdate,
}: Props) {
	const [updatingRules, setUpdatingRules] = useState<string[]>([]);

	async function handleStatusUpdate(rule: PaymentRule) {
		try {
			setUpdatingRules((rules) => [...rules, rule.id]);

			const updatedRule = await updatePaymentRule(rule.id, {
				status:
					rule.status === PaymentRuleStatus.Active
						? PaymentRuleStatus.Inactive
						: PaymentRuleStatus.Active,
			});

			onUpdate(updatedRule);
		} catch {
		} finally {
			setUpdatingRules((rules) => rules.filter((x) => x !== rule.id));
		}
	}

	return (
		<div className="space-y-6">
			<Head.Root className="gap-x-2">
				<Head.Title text="لیست قوانین پرداخت">
					{rules.length > 0 && (
						<Button
							className="flex w-fit items-center justify-center border-none px-0"
							disabled={loading}
							variant="link"
							onClick={onReload}
						>
							{loading ? (
								<Loading horizontalPlacement="center" size="sm" />
							) : (
								<FaRotate />
							)}
						</Button>
					)}
				</Head.Title>
			</Head.Root>

			<Panel.Root>
				<Table.Root>
					<Table.Head>
						<Table.Row className="bg-gray-100 text-right">
							<Table.Cell as="th" className="w-12"></Table.Cell>
							<Table.Cell as="th" className="w-14">
								ردیف
							</Table.Cell>
							<Table.Cell as="th" className="w-56">
								نام قرارداد
							</Table.Cell>
							{conditions.buyer && (
								<Table.Cell as="th" className="w-56">
									خریدار
								</Table.Cell>
							)}
							<Table.Cell as="th" className="w-44">
								پرداخت
							</Table.Cell>
							<Table.Cell as="th">شرایط</Table.Cell>
							<Table.Cell as="th" className="w-36">
								وضعیت
							</Table.Cell>
						</Table.Row>
					</Table.Head>
					<Table.Body>
						{rules.length > 0 &&
							rules.map((rule: PaymentRule, index: number) => {
								const isUpdating = !!updatingRules.find((x) => x === rule.id);
								const showEdit = rule.status === PaymentRuleStatus.Active;

								return (
									<Table.Row key={rule.id}>
										<Table.Cell>
											<Table.Actions>
												{isUpdating ? (
													<Table.Action onClick={() => onEdit(rule)}>
														<Loading horizontalPlacement="center" size="xs" />
													</Table.Action>
												) : (
													<>
														{showEdit && (
															<Table.Action onClick={() => onEdit(rule)}>
																<FaPencil />
															</Table.Action>
														)}
														<Table.Action
															onClick={() => handleStatusUpdate(rule)}
														>
															{rule.status === PaymentRuleStatus.Active ? (
																<FaEyeSlash />
															) : (
																<FaEye />
															)}
														</Table.Action>
													</>
												)}
											</Table.Actions>
										</Table.Cell>
										<Table.Cell>{index + 1}</Table.Cell>
										<Table.Cell>{rule.name}</Table.Cell>
										{conditions.buyer && (
											<Table.Cell>{rule.buyer?.name || "-"}</Table.Cell>
										)}
										<Table.Cell>
											<div>
												{rule.type === PaymentRuleType.Fixed
													? `${toCurrency(rule.amount.toString())} ریال`
													: `${rule.amount} درصد`}{" "}
												<span className="text-xs">
													({paymentRuleType[rule.type]})
												</span>
											</div>
											<div>{paymentRuleMethod[rule.method]}</div>
										</Table.Cell>
										<Table.Cell>
											<PaymentRulesTableItemCases cases={rule.cases} />
										</Table.Cell>
										<Table.Cell>{paymentRuleStatus[rule.status]}</Table.Cell>
									</Table.Row>
								);
							})}
					</Table.Body>
				</Table.Root>
			</Panel.Root>
		</div>
	);
}

export default PaymentRulesTable;
