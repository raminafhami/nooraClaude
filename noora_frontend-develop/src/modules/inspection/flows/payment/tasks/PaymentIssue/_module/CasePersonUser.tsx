"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import createCustomer from "@/financial/sepidar/customer/service/createCustomer";
import getCustomerCheck from "@/financial/sepidar/customer/service/getCustomer";
import { Input } from "@/form/Input";
import { Personnel } from "@/hrm/personnel/models/Personnel";
import { getPersonnelById } from "@/hrm/personnel/services/getPersonnelById";
import { User } from "@/identity/users/models/User";
import { UserType } from "@/identity/users/models/UserType";
import getUserById from "@/identity/users/services/getUserById";
import updateUser from "@/identity/users/services/updateUser";
import { Loading } from "@/ui/Loader";
import { Seperator } from "@/ui/Seperator";

import { AssigneeType } from "../../../models/Assignee";
import { ids } from "../../../models/Ids";
import { FormData } from "../PhasePage";

export default function CasePersonUser() {
	const {
		task: { data },
		save,
	} = useTaskContext();

	const { setValue, watch } = useFormContext<FormData>();
	const { [ids.payerSepidarId]: userSepidarId } = watch();

	const userId: string = data[ids.assignees][AssigneeType.Payer].id;
	const [user, setUser] = useState<User | null>(null);
	const [personnel, setPersonnel] = useState<Personnel | null>(null);

	const [isChecked, setChecked] = useState<boolean>(false);

	const [isProcessing, setProcessing] = useState<boolean>(false);
	const [isChecking, setChecking] = useState<boolean>(false);
	const [isCreating, setCreating] = useState<boolean>(false);

	const [code, setCode] = useState<string>("");

	async function handleCheck() {
		try {
			setProcessing(true);
			setChecking(true);

			const user = await getUserById(userId);

			let sepidarId: string | null = null;
			if (user.sepidarId) {
				sepidarId = user.sepidarId;
			} else {
				const result: any = await getCustomerCheck({
					nationalCode: user.nationalCode,
				});

				const dlcode = result["DlCode"] || undefined;
				if (dlcode) {
					await updateUser(user.id, {
						sepidarId: dlcode,
					});
					sepidarId = dlcode;
				}
			}

			if (sepidarId) {
				setValue(ids.payerSepidarId, sepidarId, {
					shouldDirty: true,
					shouldTouch: true,
					shouldValidate: true,
				});

				await save({ [ids.payerSepidarId]: sepidarId });
			} else {
				try {
					const personnel = await getPersonnelById(user.id, []);
					setPersonnel(personnel);
				} catch {}
				setUser(user);
			}

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

			if (!user) {
				throw new Error();
			}

			let sepidarId: string | null = null;
			const normalizedCode = parseInt(code.trim());
			const result: any = await createCustomer({
				code: !isNaN(normalizedCode) ? normalizedCode.toString() : null,
				name: user.firstname,
				lastname: user.lastname,
				type: "natural",
				isCustomer: user.type === UserType.Public,
				nationalCode: user.nationalCode || "",
				contactNo: user.phoneNo || "",
				postalCode: "",
				address: personnel?.address?.trim() || "",
			});

			const dlcode = result["DlCode"] || undefined;
			if (dlcode) {
				await updateUser(user.id, {
					sepidarId: dlcode,
				});
				sepidarId = dlcode;
			}

			if (sepidarId) {
				setValue(ids.payerSepidarId, sepidarId, {
					shouldDirty: true,
					shouldTouch: true,
					shouldValidate: true,
				});

				setUser(null);
				setPersonnel(null);

				await save({ [ids.payerSepidarId]: sepidarId });
			}
		} catch {
		} finally {
			setCreating(false);
			setProcessing(false);
		}
	}

	return (
		!userSepidarId && (
			<>
				<Seperator className="mt-5" />

				<div className="col-span-3 col-start-1 space-y-2">
					<label htmlFor="payer.code">طرف حساب:</label>
					<div className="flex gap-x-2">
						<Input
							disabled={isProcessing || !isChecked}
							id="payer.code"
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
						<span>بررسی طرف حساب</span>
						{isChecking && <Loading size="xs" />}
					</Button>

					<Button
						className="flex h-10 items-center gap-x-2"
						disabled={isProcessing || !isChecked}
						type="button"
						variant="outline"
						onClick={handleCreate}
					>
						<span>ثبت طرف حساب</span>
						{isCreating && <Loading size="xs" />}
					</Button>
				</div>
			</>
		)
	);
}
