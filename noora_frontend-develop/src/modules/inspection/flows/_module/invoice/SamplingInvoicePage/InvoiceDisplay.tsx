import moment from "moment-jalaali";
import Link from "next/link";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaCopy } from "react-icons/fa";
import { toast } from "sonner";

import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Button } from "@/components/ui/button";
import { useInspectionContext } from "@/inspection/context/InspectionContext";
import { routes } from "@/routes";
import generateTemplate from "@/template-engine/services/generateTemplate";
import { Head } from "@/ui/Head";
import Select from "@/ui/Select/Select";
import downloadBlob from "@/utils/downloadBlob";

import SendSms from "../SendSMS/SendSms";
import { ids } from "./InvoiceIds";
import { InvoiceType, invoiceTypeOptions } from "./InvoiceType";

export const InvoiceDisplay = memo(function InvoiceDisplay() {
	const { instance } = useInspectionContext();

	const [error, setError] = useState<string | null>(null);
	const [isLoading, setLoading] = useState<boolean>(true);
	const [content, setContent] = useState<string>("");

	const [invoiceType, setInvoiceType] = useState<InvoiceType>(
		instance.parameters?.[ids.caseInvoiceNo]
			? InvoiceType.Invoice
			: InvoiceType.Preinvoice,
	);

	const templateUrl = useMemo(() => {
		return `inspection/sampling/shared/${
			invoiceType === InvoiceType.Preinvoice ? "Preinvoice" : "Invoice"
		}.html`;
	}, [invoiceType]);

	const iframeRef = useRef<HTMLIFrameElement | null>(null);

	const fetchTemplateContent = useCallback(async () => {
		try {
			setLoading(true);

			if (
				invoiceType === InvoiceType.Invoice &&
				!instance.parameters[ids.caseInvoiceDate]
			) {
				throw new Error(
					"به دلیل عدم وجود تاریخ ثبت فاکتور، امکان نمایش فاکتور وجود ندارد.",
				);
			}

			const content = await generateTemplate({
				name: templateUrl,
				data: {
					caseNo: instance.caseNo,
					[ids.buyerData]: instance.parameters[ids.buyerData],
					[ids.caseInvoiceDate]: instance.parameters[ids.caseInvoiceDate]
						? moment(instance.parameters[ids.caseInvoiceDate]).format(
								"jYYYY/jMM/jDD",
							)
						: undefined,
					[ids.caseInvoiceNo]: instance.parameters[ids.caseInvoiceNo],
					[ids.inspectionFee]: instance.parameters[ids.inspectionFee],
					[ids.invoiceTax]: instance.parameters[ids.invoiceTax],
					[ids.invoiceDuty]: instance.parameters[ids.invoiceDuty],
					[ids.invoiceTotal]: instance.parameters[ids.invoiceTotal],
				},
				output: `${instance.caseNo} ${
					invoiceType === InvoiceType.Invoice ? "Invoice" : "Preinvoice"
				}.pdf`,
				download: false,
			});

			if (content) {
				setContent(content);
			}
		} catch (err: any) {
			console.error(err);
			setError(err.message || "Something went wrong.");
		} finally {
			setLoading(false);
		}
	}, [instance.caseNo, instance.parameters, invoiceType, templateUrl]);

	useEffect(() => {
		fetchTemplateContent();
	}, [instance, fetchTemplateContent]);

	return (
		<div className="space-y-6">
			<Head.Root>
				<Head.Title text="فاکتور و پیش فاکتور" />
			</Head.Root>

			{instance.parameters?.[ids.caseInvoiceNo] && (
				<div className="flex items-center gap-x-3">
					<label htmlFor="letterType">نوع:</label>
					<div className="basis-48">
						<Select
							id="letterType"
							value={invoiceType}
							items={invoiceTypeOptions}
							onChange={(v) => setInvoiceType(v as InvoiceType)}
						/>
					</div>
				</div>
			)}

			{isLoading ? (
				<div className="w-fit rounded-xl border-e-8 border-s-8 border-gray-200">
					<div className="overflow-hidden border border-gray-200">
						<div className="h-[32rem] w-a4-portrait overflow-y-auto"></div>
					</div>
				</div>
			) : error ? (
				<DestructiveAlert>
					<AlertDescription>{error}</AlertDescription>
				</DestructiveAlert>
			) : (
				<div className="space-y-6">
					<div className="w-fit rounded-xl border-e-8 border-s-8 border-gray-200">
						<div className="overflow-hidden border border-gray-200">
							<iframe
								className="h-[32rem] w-a4-portrait overflow-y-auto"
								ref={iframeRef}
								srcDoc={content}
							/>
						</div>
					</div>

					<div className="flex gap-x-3">
						<Button
							className="min-w-24"
							onClick={async () => {
								const blob = await generateTemplate({
									name: templateUrl,
									data: {
										caseNo: instance.caseNo,
										[ids.buyerData]: instance.parameters[ids.buyerData],
										[ids.caseInvoiceDate]: instance.parameters[
											ids.caseInvoiceDate
										]
											? moment(instance.parameters[ids.caseInvoiceDate]).format(
													"jYYYY/jMM/jDD",
												)
											: undefined,
										[ids.caseInvoiceNo]: instance.parameters[ids.caseInvoiceNo],
										[ids.inspectionFee]: instance.parameters[ids.inspectionFee],
										[ids.invoiceTax]: instance.parameters[ids.invoiceTax],
										[ids.invoiceDuty]: instance.parameters[ids.invoiceDuty],
										[ids.invoiceTotal]: instance.parameters[ids.invoiceTotal],
									},
									output: "file",
									download: true,
								});

								downloadBlob({
									blob,
									filename: `${instance.caseNo} ${
										invoiceType === InvoiceType.Invoice
											? "Invoice"
											: "Preinvoice"
									}.pdf`,
								});
							}}
						>
							دانلود
						</Button>

						<Button
							className="min-w-24"
							onClick={() => {
								iframeRef.current?.contentWindow?.print();
							}}
						>
							پرینت
						</Button>
					</div>

					<div className="flex max-w-60 select-none items-center rounded-2xl border">
						<Link
							href={`${routes.app}/paymentGateway/sampling/${instance.id}:${
								invoiceType === InvoiceType.Preinvoice
									? "Preinvoice"
									: "Invoice"
							}`}
							target="_blank"
							dir="ltr"
							className="mx-1 overflow-x-hidden text-ellipsis whitespace-nowrap break-words hover:text-blue-500"
						>{`${routes.app}/paymentGateway/sampling/${instance.id}:${
							invoiceType === InvoiceType.Preinvoice ? "Preinvoice" : "Invoice"
						}`}</Link>

						<Button
							onClick={() => {
								navigator.clipboard.writeText(
									`${routes.app}/paymentGateway/sampling/${instance.id}:${
										invoiceType === InvoiceType.Preinvoice
											? "Preinvoice"
											: "Invoice"
									}`,
								);
								toast.success("لینک درگاه پرداخت با موفقیت کپی شد");
							}}
							className="mr-1"
						>
							<FaCopy size={17} />
						</Button>
					</div>

					<SendSms
						customerId={instance?.parameters?.Assignees?.customer?.id}
						instanceId={instance?.id}
						invoiceType={invoiceType}
						options={instance?.parameters?.Buyer?.phoneNo}
						reciverName={instance?.parameters?.Buyer?.name}
					/>
				</div>
			)}
		</div>
	);
});
