import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import createsms from "@/api/sms/createsms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { MaskInput } from "@/form/MaskInput";
import { User } from "@/identity/users/models/User";
import getUserById from "@/identity/users/services/getUserById";
import { useInspectionContext } from "@/inspection/context/InspectionContext";
import { InspectionType } from "@/inspection/models/InspectionType";
import detectInspectionType from "@/inspection/utils/detectInspectionType";
import { Loading } from "@/ui/Loader";

import { InvoiceType } from "../StandardInvoicePage/InvoiceType";

interface SendSmsProps {
	instanceId: string;
	invoiceType: InvoiceType;
	options: any;
	reciverName: string;
	customerId: string;
}

export default function SendSms({
	instanceId,
	invoiceType,
	options,
	reciverName,
	customerId,
}: SendSmsProps) {
	const { instance } = useInspectionContext();

	const [inputMode, setInputMode] = useState<string>("customer");
	const [phoneNo, setPhoneNo] = useState<string>("");
	const [name, setName] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);
	const [customerPhoneNo, setCustomerPhoneNo] = useState<User>();

	const templateType = useMemo(() => {
		const inspectionType = detectInspectionType(instance.processKey);
		return inspectionType !== InspectionType.Sampling ? "standard" : "sampling";
	}, [instance.processKey]);

	async function sendSms() {
		setLoading(true);

		if (inputMode === "manual") {
			if (phoneNo?.length !== 11) {
				toast.error("شماره موبایل نامعتبر است.");
				setLoading(false);
				return;
			}
			if (!name?.length) {
				toast.error("لطفا نام خریدار را وارد کنید.");
				setLoading(false);
				return;
			}
		} else {
			if (!options?.startsWith("09")) {
				toast.error("شماره موبایل خریدار نامعتبر است.");
				setLoading(false);
				return;
			}
			if (!customerPhoneNo?.phoneNo?.startsWith("09")) {
				toast.error("شماره موبایل مشتری نامعتبر است.");
				setLoading(false);
				return;
			}
		}

		try {
			let res = await createsms({
				phoneNo:
					inputMode === "manual"
						? phoneNo
						: inputMode === "buyer"
							? options
							: customerPhoneNo?.phoneNo,
				templateNo: 750067,
				messageParameters: [
					{
						name: "FULLNAME",
						value:
							inputMode === "manual"
								? name
								: inputMode === "buyer"
									? reciverName
									: `${customerPhoneNo?.fullname}`,
					},
					{ name: "TEMPLATETYPE", value: templateType },
					{ name: "INSTANCEID", value: instanceId },
					{
						name: "INVOICETYPE",
						value:
							invoiceType === InvoiceType.Preinvoice ? "Preinvoice" : "Invoice",
					},
				],
			});
			if (res) {
				toast.success("پیامک با موفقیت ارسال شد.");
				setLoading(false);
			}
		} catch {
			toast.error("خطا در ارسال پیامک.");
			setLoading(false);
		}
	}

	useEffect(() => {
		(async () => {
			try {
				setLoading(true);

				let res = await getUserById(customerId);
				if (res) {
					setLoading(false);
					setCustomerPhoneNo(res);
				}
			} catch (err: any) {
				console.error(err);
			} finally {
				setLoading(false);
			}
		})();
	}, [customerId]);

	return (
		<div className="flex items-center">
			<Label className="mx-1">ارسال پیامک برای:</Label>
			<Select disabled={loading} onValueChange={setInputMode} value={inputMode}>
				<SelectTrigger className="w-[180px]">
					<SelectValue placeholder="انتخاب" />
				</SelectTrigger>
				<SelectContent>
					{customerPhoneNo?.phoneNo?.startsWith("09") && (
						<SelectItem value={"customer"}>مشتری</SelectItem>
					)}
					{options?.startsWith("09") && (
						<SelectItem value={"buyer"}>خریدار</SelectItem>
					)}
					<SelectItem value="manual">دلخواه</SelectItem>
				</SelectContent>
			</Select>

			{inputMode === "manual" && (
				<Input
					className="mx-2 max-w-[300px]"
					placeholder="نام خریدار"
					value={name}
					onChange={(e) => setName(e.target.value)}
				/>
			)}
			{inputMode === "manual" && (
				<MaskInput
					mask={"00000000000"}
					placeholder="شماره موبایل"
					className="mx-2 max-w-[300px]"
					value={phoneNo}
					onMutate={(e) => setPhoneNo(e)}
				/>
			)}

			<Button onClick={sendSms} className="mx-2" disabled={loading}>
				{loading ? <Loading /> : "ارسال"}
			</Button>
		</div>
	);
}
