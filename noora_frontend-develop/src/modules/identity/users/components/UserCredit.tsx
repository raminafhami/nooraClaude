"use client";

import React, { useCallback, useEffect, useState } from "react";
import { FaCreditCard, FaRotate } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardIcon,
	CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { InstanceStatus } from "@/felo/instances/enums/InstanceStatus";
import { getInstances } from "@/felo/instances/services/getInstances";
import { InvoicePaymentStatus } from "@/inspection/models/InvoicePaymentStatus";

import getActiveUser from "../services/getActiveUser";

const UserCredit = ({ userId }: { userId: string }) => {
	const [loading, setLoading] = useState<boolean>(true);
	const [userCreditRemain, setUserCreditRemain] = useState<number>(0);
	const [userDebt, setUserDebt] = useState<number>(0);
	const [userCreditWithDebt, setUserCreditWithDebt] = useState<number>(0);

	const GetUserCreditData = useCallback(async () => {
		setLoading(true);
		try {
			const [user, debt] = await Promise.all([
				getActiveUser(),
				getInstances({
					filters: [
						{ name: "status", value: InstanceStatus.Completed },
						{
							name: "processDefinitionKey",
							value: { $regex: `^Inspection_Case` },
						},
						{ name: `parameters.Assignees.customer.id`, value: userId },
						{
							name: "parameters.InvoicePaymentStatus",
							value: { $exists: true },
						},
						{
							name: "parameters.InvoicePaymentStatus",

							value: InvoicePaymentStatus.Unpaid,
						},
					],
					props: ["InvoiceTotal"],
				}).then((instances) => {
					const debt = instances
						.map(
							(instance) => Number(instance.parameters?.["InvoiceTotal"]) || 0,
						)
						.reduce((acc, curr) => acc + curr, 0);

					return debt;
				}),
			]);

			setUserCreditWithDebt(user.credit - debt);
			setUserCreditRemain(user.credit);
			setUserDebt(debt);
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	}, [userId]);

	useEffect(() => {
		GetUserCreditData();
	}, [GetUserCreditData]);
	return (
		<div className="col-span-full">
			<Card>
				<CardHeader orientation="horizontal">
					<CardTitle>
						<CardIcon>
							<FaCreditCard />
						</CardIcon>
						<span>اعتبار حساب</span>
						<Button
							size="icon"
							variant="link"
							onClick={() => !loading && GetUserCreditData()}
						>
							<Spinner loading={loading} size="xs">
								<FaRotate />
							</Spinner>
						</Button>
					</CardTitle>
				</CardHeader>

				<CardContent>
					<div className="grid grid-cols-12 gap-5">
						<div className="col-span-3 flex flex-col items-start gap-2">
							<div className="text-muted-foreground">سقف اعتبار</div>
							<div>{userCreditRemain?.toLocaleString()} ریال</div>
						</div>
						<div className="col-span-3 flex flex-col items-start gap-2">
							<div className="text-muted-foreground"> اعتبار موجود</div>
							<div>{userCreditWithDebt?.toLocaleString()} ریال</div>
						</div>
						<div className="col-span-3 flex flex-col items-start gap-2">
							<div className="text-muted-foreground"> مجموع بدهی‌ها</div>
							<div>{userDebt?.toLocaleString()} ریال</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export { UserCredit };
