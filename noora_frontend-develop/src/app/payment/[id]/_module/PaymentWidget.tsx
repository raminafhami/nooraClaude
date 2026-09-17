"use client";

import logo from "/public/images/noorazmalogo.png";
import moment from "jalali-moment";
import Image from "next/image";
import { notFound, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaCheckDouble } from "react-icons/fa6";

import { isApiResponse } from "@/api/utils/isApiResponse";
import revalLogo from "@/assets/images/reval-logo.png";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { InvoiceExpiryAt } from "@/financial/invoices/components/InvoiceExpiryAt";
import { InvoiceStatus } from "@/financial/invoices/enums/InvoiceStatus";
import { Invoice } from "@/financial/invoices/models/Invoice";
import { getInvoiceByEncryptedId } from "@/financial/invoices/services/getInvoiceByEncryptedId";
import { parseInvoice } from "@/financial/invoices/utils/parseInvoice";
import { toCurrency } from "@/utils/String";

import { InvoiceDownloadButton } from "./InvoiceDownloadButton";
import { InvoicePaymentButton } from "./InvoicePaymentButton";
import { PageError } from "./PageError";

const paymentSuccess = {
	true: true,
	false: false,
	undefined: undefined,
};

function PaymentWidget({ id }: { id: string }) {
	const searchParams = useSearchParams();

	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [errorMessage, setErrorMessage] = useState<string>();
	const [invoice, setInvoice] = useState<Invoice>();

	useEffect(() => {
		(async () => {
			try {
				setIsLoading(true);
				setErrorMessage(undefined);

				const invoice = await getInvoiceByEncryptedId(id).then((invoice) =>
					parseInvoice(invoice),
				);

				setInvoice(invoice);
			} catch (err) {
				console.error(err);

				if (isApiResponse(err)) {
					if (err.message === "Invoice status is canceled") {
						setErrorMessage("فاکتور مورد نظر لغو شده است.");
					}
				}
			} finally {
				setIsLoading(false);
			}
		})(),
			[];
	}, [id]);

	if (isLoading) {
		return (
			<div className="flex min-h-svh w-full items-center justify-center">
				<Spinner size="sm" label="در حال دریافت اطلاعات..." />
			</div>
		);
	}

	if (!invoice) {
		if (errorMessage) {
			return <PageError>{errorMessage}</PageError>;
		}

		notFound();
	}

	const isPaymentSuccess =
		paymentSuccess[
			(searchParams.get("success") ??
				"undefined") as keyof typeof paymentSuccess
		];

	const showPaymentSuccess =
		isPaymentSuccess && invoice.status === InvoiceStatus.Paid;
	const showPaymentFailure =
		typeof isPaymentSuccess !== "undefined" &&
		!isPaymentSuccess &&
		invoice.status !== InvoiceStatus.Paid;

	return (
		<div className="flex min-h-svh flex-col items-center justify-center gap-8 pb-12 sm:pb-4 sm:pt-4 md:px-10">
			<Card className="w-full rounded-none bg-gradient-to-r from-blue-200 to-gray-200 md:max-w-screen-md md:rounded-2xl">
				<div className="space-y-6 pb-6">
					<div className="flex items-center gap-x-10 px-10">
						<Image src={logo} height={240} alt="NAIT" />
						<div className="text-base/8 xs:text-lg/10">
							شرکت بازرسی و خدمات آزمایشگاهی نورا آزما بین‌الملل
						</div>
					</div>

					<div className="mx-6 space-y-8 rounded-2xl bg-white/30 px-6 py-6 backdrop-blur-md">
						<div className="space-y-4">
							<div className="flex items-center gap-3">
								<span>اطلاعات</span>
								<Separator className="h-0.5 w-auto grow rounded bg-white/60" />
							</div>

							<div className="grid grid-cols-12 gap-6">
								<div className="col-span-full space-y-2 xs:col-span-6">
									<div className="text-muted-foreground">وضعیت صدور</div>
									<div>{invoice.issueNo ? "فاکتور" : "پیش فاکتور"}</div>
								</div>

								<div className="col-span-full space-y-2 xs:col-span-6">
									<div className="text-muted-foreground">وضعیت پرداخت</div>
									<div>
										{invoice.status === InvoiceStatus.Paid
											? "پرداخت شده"
											: invoice.status === InvoiceStatus.Pending
												? "در انتظار بررسی"
												: "پرداخت نشده"}
									</div>
								</div>

								<div className="col-span-full space-y-2 xs:col-span-6">
									<div className="text-muted-foreground">گیرنده</div>
									<div>
										{invoice.recipient.name} {invoice.recipient.lastname}
									</div>
								</div>

								<div className="col-span-full space-y-2 xs:col-span-6">
									<div className="text-muted-foreground">مبلغ</div>
									<div>
										{toCurrency((invoice.total + invoice.tax).toString())} ریال
									</div>
								</div>

								{invoice.issueNo && invoice.issuedAt && (
									<>
										<div className="col-span-full space-y-2 xs:col-span-6">
											<div className="text-muted-foreground">شماره فاکتور</div>
											<div>{invoice.issueNo}</div>
										</div>

										<div className="col-span-full space-y-2 xs:col-span-6">
											<div className="text-muted-foreground">تاریخ فاکتور</div>
											<div>
												{moment(invoice.issuedAt).format("jYYYY/jMM/jDD")}
											</div>
										</div>
									</>
								)}

								<div className="col-span-full space-y-2 xs:col-span-6">
									<div className="text-muted-foreground">تاریخ انقضا</div>
									<div>
										<InvoiceExpiryAt date={invoice.expiryAt} />
									</div>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center gap-3">
								<span>عملیات ها</span>
								<Separator className="h-0.5 w-auto grow rounded bg-white/60" />
							</div>

							<div className="flex flex-col items-center gap-4 xs:flex-row">
								<InvoiceDownloadButton invoice={invoice} encryptedId={id} />
								<InvoicePaymentButton invoice={invoice} encryptedId={id} />
							</div>
						</div>
					</div>

					{(showPaymentSuccess || showPaymentFailure) && (
						<div className="mx-6">
							{showPaymentSuccess && (
								<Alert variant="success">
									<FaCheckDouble />
									<AlertDescription>
										عملیات پرداخت با موفقیت انجام شد.
									</AlertDescription>
								</Alert>
							)}

							{showPaymentFailure && (
								<DestructiveAlert>
									<AlertDescription>
										عملیات پرداخت با شکست مواجه شد.
									</AlertDescription>
								</DestructiveAlert>
							)}
						</div>
					)}
				</div>
			</Card>

			<div className="flex flex-col items-center justify-center gap-4">
				<div>توسعه داده شده توسط روال</div>
				<div>
					<a href="https://reval.ir" target="_blank">
						REVAL.IR
					</a>
				</div>
				<div>
					<Image
						src={revalLogo}
						alt=""
						loading="eager"
						width={150}
						height={50}
					/>
				</div>
			</div>
		</div>
	);
}

export { PaymentWidget };
