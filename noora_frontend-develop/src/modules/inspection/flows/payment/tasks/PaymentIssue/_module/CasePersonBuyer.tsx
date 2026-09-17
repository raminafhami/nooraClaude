"use client";

import { useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";

import { Buyer } from "@/buyers/models/Buyer";
import { getBuyers } from "@/buyers/services/getBuyers";
import { updateBuyer } from "@/buyers/services/updateBuyer";
import { Button } from "@/components/ui/button";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import createCustomer from "@/financial/sepidar/customer/service/createCustomer";
import getCustomerCheck from "@/financial/sepidar/customer/service/getCustomer";
import { Input } from "@/form/Input";
import { Loading } from "@/ui/Loader";
import { Seperator } from "@/ui/Seperator";

import { ids } from "../../../models/Ids";
import { FormData } from "../PhasePage";

export default function CasePersonBuyer() {
	const { save } = useTaskContext();

	const { setValue, watch } = useFormContext<FormData>();
	const { [ids.inspectionCases]: caseItems } = watch();

	const [buyers, setBuyers] = useState<Buyer[]>([]);

	const unregisteredBuyers = useMemo(() => {
		return [
			...new Set(
				caseItems
					.map((x) => x.buyer)
					.filter((x) => !x.sepidarId)
					.map((x) => x.id),
			),
		];
	}, [caseItems]);

	const [isChecked, setChecked] = useState<boolean>(false);

	const [isProcessing, setProcessing] = useState<boolean>(false);
	const [isChecking, setChecking] = useState<boolean>(false);
	const [isCreating, setCreating] = useState<boolean>(false);

	const [code, setCode] = useState<string>("");

	async function handleCheck() {
		try {
			setProcessing(true);
			setChecking(true);

			const buyers = await getBuyers({
				filters: { _id: unregisteredBuyers },
			});

			if (unregisteredBuyers.length !== buyers.length) {
				throw new Error();
			}

			const updatingBuyers: Buyer[] = [];
			await Promise.all(
				buyers.map(async (buyer) => {
					if (buyer.sepidarId) {
						updatingBuyers.push(buyer);
					} else {
						const result: any = await getCustomerCheck({
							nationalCode: buyer.nationalCode,
						});

						const dlcode = result["DlCode"] || undefined;
						if (dlcode) {
							const updatedBuyer = await updateBuyer(buyer.id, {
								sepidarId: dlcode,
							});
							updatingBuyers.push(updatedBuyer);
						}
					}
				}),
			);

			if (updatingBuyers.length) {
				let updatedCaseItems = [...caseItems];
				updatingBuyers.map((buyer) => {
					updatedCaseItems = updatedCaseItems.map((caseItem) =>
						caseItem.buyer.id !== buyer.id
							? caseItem
							: {
									...caseItem,
									buyer: { ...caseItem.buyer, sepidarId: buyer.sepidarId },
								},
					);
				});

				setValue(ids.inspectionCases, updatedCaseItems, {
					shouldDirty: true,
					shouldTouch: true,
					shouldValidate: true,
				});

				await save({ [ids.inspectionCases]: updatedCaseItems });
			}

			setBuyers(
				buyers.filter(
					(buyer) => !updatingBuyers.find((x) => x.id === buyer.id),
				),
			);

			setChecked(true);
		} catch {
		} finally {
			setChecking(false);
			setProcessing(false);
		}
	}

	async function handleCreate() {
		try {
			setProcessing(true);
			setCreating(true);

			const updatingBuyers: Buyer[] = [];

			let noramalizedCode = parseInt(code);
			for (let i = 0; i < buyers.length; i++) {
				const buyer = buyers[i];
				const currentCode = !isNaN(noramalizedCode)
					? noramalizedCode.toString()
					: null;

				const result: any = await createCustomer({
					code: currentCode,
					name: buyer.name || buyer.nameEn,
					type: buyer.type,
					isCustomer: true,
					nationalCode: buyer.nationalCode || "",
					contactNo:
						(buyer.phoneNo === "string" ? buyer.phoneNo : buyer.phoneNo[0]) ||
						"",
					postalCode: buyer.postalCode || "",
					address: buyer.address.trim() || "",
				});

				const dlcode = result["DlCode"] || undefined;
				if (dlcode) {
					const updatedBuyer = await updateBuyer(buyer.id, {
						sepidarId: dlcode,
					});
					updatingBuyers.push(updatedBuyer);

					if (currentCode) {
						noramalizedCode += 1;
					}
				}
			}

			if (updatingBuyers.length !== 0) {
				let updatedCaseItems = [...caseItems];
				updatingBuyers.forEach((buyer) => {
					updatedCaseItems.forEach((caseItem) => {
						if (caseItem.buyer.id === buyer.id) {
							caseItem.buyer.sepidarId = buyer.sepidarId;
						}
					});
				});

				setValue(ids.inspectionCases, updatedCaseItems, {
					shouldDirty: true,
					shouldTouch: true,
					shouldValidate: true,
				});

				setBuyers(
					buyers.filter(
						(buyer) => !updatingBuyers.find((x) => x.id === buyer.id),
					),
				);

				await save({ [ids.inspectionCases]: updatedCaseItems });
			}
		} catch (err: any) {
			console.error(err);
		} finally {
			setCreating(false);
			setProcessing(false);
		}
	}

	return (
		unregisteredBuyers.length !== 0 && (
			<>
				<Seperator className="mt-5" />

				<div className="col-span-3 col-start-1 space-y-2">
					<label htmlFor="buyer.code">طرف حساب:</label>
					<div className="flex gap-x-2">
						<Input
							disabled={isProcessing || !isChecked}
							id="buyer.code"
							value={code}
							onChange={(e) => setCode(e.target.value)}
						/>
					</div>
				</div>

				<div className="col-span-3 flex gap-x-2 pt-7">
					<Button
						className="flex h-10 items-center gap-x-2"
						disabled={isProcessing || isChecked}
						type="button"
						variant="outline"
						onClick={handleCheck}
					>
						<span>بررسی وجود طرف حساب</span>
						{isChecking && <Loading size="xs" />}
					</Button>

					<Button
						className="flex h-10 items-center gap-x-2"
						disabled={isProcessing || !isChecked}
						type="button"
						variant="outline"
						onClick={handleCreate}
					>
						<span>ایجاد طرف حساب</span>
						{isCreating && <Loading size="xs" />}
					</Button>
				</div>
			</>
		)
	);
}
