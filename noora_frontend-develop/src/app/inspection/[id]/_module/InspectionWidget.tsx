"use client";

import logo from "/public/images/noorazmalogo.png";
import Image from "next/image";

import revalLogo from "@/assets/images/reval-logo.png";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { instanceStatus } from "@/felo/instances/enums/InstanceStatus";
import { Instance } from "@/felo/instances/models/Instance";

import { CertificateDownloadButton } from "./CertificateDownloadButton";

function InspectionWidget({
	instance,
	encryptedId,
}: {
	instance: Instance;
	encryptedId: string;
}) {
	const isCertificateIssued =
		instance.parameters?.["CertificateIssueNo"] &&
		instance.parameters?.["CertificateIssueDate"];

	const hasActions = isCertificateIssued;

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
									<div className="text-muted-foreground">شماره درخواست</div>
									<div>{instance.caseNo}</div>
								</div>

								<div className="col-span-full space-y-2 xs:col-span-6">
									<div className="text-muted-foreground">نوع درخواست</div>
									<div>{instance.processName}</div>
								</div>

								<div className="col-span-full space-y-2 xs:col-span-6">
									<div className="text-muted-foreground">وضعیت درخواست</div>
									<div>{instanceStatus[instance.status!]}</div>
								</div>

								<div className="col-span-full space-y-2 xs:col-span-6">
									<div className="text-muted-foreground">وضعیت گواهی</div>
									<div>{isCertificateIssued ? "صادر شده" : "عدم صدور"}</div>
								</div>
							</div>
						</div>

						{isCertificateIssued && (
							<div className="space-y-4">
								<div className="flex items-center gap-3">
									<span>اطلاعات گواهی</span>
									<Separator className="h-0.5 w-auto grow rounded bg-white/60" />
								</div>

								<div className="grid grid-cols-12 gap-6">
									<div className="col-span-full space-y-2 xs:col-span-6">
										<div className="text-muted-foreground">شماره گواهی</div>
										<div>NAIT{instance.parameters["CertificateIssueNo"]}</div>
									</div>

									<div className="col-span-full space-y-2 xs:col-span-6">
										<div className="text-muted-foreground">تاریخ گواهی</div>
										<div>{instance.parameters["CertificateIssueDate"]}</div>
									</div>
								</div>
							</div>
						)}

						{hasActions && (
							<div className="space-y-4">
								<div className="flex items-center gap-3">
									<span>عملیات ها</span>
									<Separator className="h-0.5 w-auto grow rounded bg-white/60" />
								</div>

								<div className="flex flex-col items-center gap-4 xs:flex-row">
									{isCertificateIssued && (
										<CertificateDownloadButton
											instance={instance}
											encryptedId={encryptedId}
										/>
									)}
								</div>
							</div>
						)}
					</div>
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

export { InspectionWidget };
