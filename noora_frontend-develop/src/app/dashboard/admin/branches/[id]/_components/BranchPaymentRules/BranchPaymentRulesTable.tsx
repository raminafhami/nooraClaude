"use client";

import { memo, useCallback, useEffect, useState } from "react";
import { FaPencil, FaRotate } from "react-icons/fa6";

import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
	Table,
	TableAction,
	TableActions,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { PaymentRule } from "@/financial/payment-rules/models/PaymentRule";
import { paymentRuleMethod } from "@/financial/payment-rules/models/PaymentRuleMethod";
import {
	PaymentRuleStatus,
	paymentRuleStatus,
} from "@/financial/payment-rules/models/PaymentRuleStatus";
import {
	PaymentRuleType,
	paymentRuleType,
} from "@/financial/payment-rules/models/PeymentRuleType";
import { getPaymentRulesByUser } from "@/financial/payment-rules/services/getPaymentRulesByUser";
import { toCurrency } from "@/utils/String";

import { useBranchContext } from "../BranchContext";

interface Props {
	onRuleEdit: (rule: PaymentRule) => void;
}

export const BranchPaymentRulesTable = memo(function BranchPaymentRulesTable({
	onRuleEdit,
}: Props): React.ReactNode {
	const { branch, paymentRules, onPaymentRulesUpdate } = useBranchContext();

	const [isLoading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	const loadRules = useCallback(async (): Promise<void> => {
		try {
			setLoading(true);

			if (branch.managerId === null) {
				throw new Error();
			}

			const rules = await getPaymentRulesByUser(branch.managerId, {
				sort: { status: "asc", name: "asc" },
			});

			setError(null);
			onPaymentRulesUpdate(rules);
		} catch (err: any) {
			console.error(err);
			setError(err?.message || "خطایی در دریافت اطلاعات رخ داد.");
		} finally {
			setLoading(false);
		}
	}, [branch.managerId, onPaymentRulesUpdate]);

	useEffect(() => {
		loadRules();
	}, [loadRules]);

	return (
		<div>
			<Card>
				<CardHeader>
					<CardTitle>
						<span>لیست قانون های پرداخت</span>
						{(paymentRules.length > 0 || error) && (
							<Button
								className="px-0"
								disabled={isLoading}
								variant="link"
								onClick={loadRules}
							>
								{isLoading ? <Spinner size="xs" /> : <FaRotate />}
							</Button>
						)}
					</CardTitle>
				</CardHeader>

				{paymentRules.length > 0 || (!isLoading && !error) ? (
					<CardContent className="px-0">
						<Table
							slotProps={{ root: { className: "rounded-none border-x-0" } }}
						>
							<TableHeader>
								<TableRow>
									<TableHead className="w-12"></TableHead>
									<TableHead className="w-14">ردیف</TableHead>
									<TableHead>نام قرارداد</TableHead>
									<TableHead className="w-44">پرداخت</TableHead>
									<TableHead className="w-24">وضعیت</TableHead>
									<TableHead></TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{paymentRules.length > 0 &&
									paymentRules.map((rule: PaymentRule, index: number) => {
										const showEdit = rule.status === PaymentRuleStatus.Active;
										const showActions = showEdit;

										return (
											<TableRow key={rule.id}>
												<TableCell>
													{showActions && (
														<TableActions>
															{showEdit && (
																<TableAction onClick={() => onRuleEdit(rule)}>
																	<FaPencil />
																</TableAction>
															)}
														</TableActions>
													)}
												</TableCell>
												<TableCell>{index + 1}</TableCell>
												<TableCell>{rule.name}</TableCell>
												<TableCell>
													<div>
														{rule.type === PaymentRuleType.Fixed
															? `${toCurrency(rule.amount.toString())} ریال`
															: `${rule.amount} درصد`}{" "}
														<span className="text-xs">
															({paymentRuleType[rule.type]})
														</span>
													</div>
													<div>{paymentRuleMethod[rule.method]}</div>
												</TableCell>
												<TableCell>{paymentRuleStatus[rule.status]}</TableCell>
												<TableCell></TableCell>
											</TableRow>
										);
									})}
							</TableBody>
						</Table>
					</CardContent>
				) : (
					<CardContent>
						{error ? (
							<DestructiveAlert>
								<AlertDescription>{error}</AlertDescription>
							</DestructiveAlert>
						) : (
							<Spinner label="در حال دریافت اطلاعات..." size="sm" />
						)}
					</CardContent>
				)}
			</Card>
		</div>
	);
});
