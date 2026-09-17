"use client";

import { useEffect, useRef, useState } from "react";
import { FaAngleLeft } from "react-icons/fa6";
import { toast } from "sonner";

import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { getInstanceById } from "@/felo/instances/services/getInstanceById";
import { useEffectOnce } from "@/hooks/useEffectOnce";
import { useInspectionContext } from "@/inspection/context/InspectionContext";
import { useInspectionQrCode } from "@/inspection/shared/hooks/useInspectionQrCode";
import { downloadInspectionCertificate } from "@/inspection/shared/utils/downloadInspectionCertificate";
import { generateInspectionCertificate } from "@/inspection/shared/utils/generateInspectionCertificate";

import { IC_CERTIFICATE_KEYS, IC_CERTIFICATE_TEMPLATE } from "../../consts";
import { ids } from "../../models/Ids";
import { downloadCertificateWord } from "../../utils/downloadCertificateWord";

function CertificatePage() {
	const { instance, onInstanceUpdate } = useInspectionContext();

	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [errorMessage, setErrorMessage] = useState<string>();

	useEffectOnce(() => {
		const fetchData = async () => {
			let data: Record<string, any> = instance.parameters || {};

			try {
				if (
					IC_CERTIFICATE_KEYS.filter((x) => data[x] === undefined).length !== 0
				) {
					setIsLoading(true);
					setErrorMessage(undefined);

					data = await getInstanceById(instance.id, IC_CERTIFICATE_KEYS).then(
						(instance) => instance.parameters || {},
					);

					onInstanceUpdate(data);
				}
			} catch {
				setErrorMessage("خطای نامشخصی رخ داد.");
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	});

	if (isLoading) {
		return <Spinner label="در حال دریافت اطلاعات..." size="sm" />;
	}

	if (errorMessage) {
		return (
			<DestructiveAlert>
				<AlertDescription>{errorMessage}</AlertDescription>
			</DestructiveAlert>
		);
	}

	return (
		<div className="space-y-12">
			<CertificatePreview />

			<CertificateActions />
		</div>
	);
}

function CertificatePreview() {
	const { instance } = useInspectionContext();

	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [errorMessage, setErrorMessage] = useState<string>();
	const [content, setContent] = useState<string>();

	const iframeRef = useRef<HTMLIFrameElement | null>(null);

	const qrCode = useInspectionQrCode(instance);

	useEffect(() => {
		(async () => {
			try {
				setIsLoading(true);
				setErrorMessage(undefined);

				const content = await generateInspectionCertificate(instance, {
					keys: IC_CERTIFICATE_KEYS,
					template: IC_CERTIFICATE_TEMPLATE,
					qrCode,
				});

				if (content) {
					setContent(content);
				}
			} catch {
				setErrorMessage("خطای نامشخصی رخ داد.");
			} finally {
				setIsLoading(false);
			}
		})();
	}, [instance, qrCode]);

	const isDraft =
		!instance.parameters?.[ids.certificateIssueNo] ||
		!instance.parameters?.[ids.certificateIssueDate];

	const fileName = isDraft ? "پیش نویس گواهی" : "گواهی";

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-3">
				<div className="shrink-0 text-base">پیش نمایش {fileName}</div>
				<Separator className="h-0.5 w-auto grow" />
			</div>

			<div className="w-fit rounded-xl border-e-8 border-s-8 border-gray-200">
				<div className="overflow-hidden border border-gray-200">
					<Spinner loading={isLoading} size="sm">
						{errorMessage && (
							<div className="flex h-[32rem] w-a4-portrait items-center justify-center">
								<DestructiveAlert>
									<AlertDescription>{errorMessage}</AlertDescription>
								</DestructiveAlert>
							</div>
						)}

						{!errorMessage && (
							<iframe
								className="h-[32rem] w-a4-portrait overflow-y-auto"
								ref={iframeRef}
								srcDoc={content}
							/>
						)}
					</Spinner>
				</div>
			</div>

			<Button
				disabled={isLoading || !!errorMessage}
				type="button"
				onClick={() => {
					iframeRef.current?.contentWindow?.print();
				}}
			>
				پرینت {fileName}
			</Button>
		</div>
	);
}

function CertificateActions() {
	const { instance } = useInspectionContext();

	type DownloadStatus = "pdf-raw" | "pdf-design" | "word";
	const [status, setStatus] = useState<DownloadStatus>();

	async function doAction(
		callback: () => Promise<void>,
		status: DownloadStatus,
	) {
		try {
			setStatus(status);

			await callback();
		} catch {
			toast.error("خطای نامشخصی در هنگام دانلود فایل رخ داد.");
		} finally {
			setStatus(undefined);
		}
	}

	const isDraft =
		!instance.parameters?.[ids.certificateIssueNo] ||
		!instance.parameters?.[ids.certificateIssueDate];

	const fileName = isDraft ? "پیش نویس گواهی" : "گواهی";

	const qrCode = useInspectionQrCode(instance);

	const ActionItem = ({ children }: React.PropsWithChildren) => (
		<div className="flex items-center gap-3">
			<FaAngleLeft />
			{children}
		</div>
	);

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-3">
				<div className="shrink-0 text-base">عملیات</div>
				<Separator className="h-0.5 w-auto grow" />
			</div>

			<div className="space-y-2">
				<ActionItem>
					<Button
						disabled={!!status}
						type="button"
						variant="link"
						onClick={() =>
							doAction(async () => {
								await downloadInspectionCertificate(instance, {
									keys: IC_CERTIFICATE_KEYS,
									template: IC_CERTIFICATE_TEMPLATE,
									qrCode,
								});
							}, "pdf-raw")
						}
					>
						<span>دانلود {fileName} قالب PDF (بدون سربرگ)</span>
					</Button>

					<Spinner loading={status === "pdf-raw"} size="xs" />
				</ActionItem>

				{!isDraft && (
					<ActionItem>
						<Button
							disabled={!!status}
							type="button"
							variant="link"
							onClick={() =>
								doAction(async () => {
									await downloadInspectionCertificate(instance, {
										keys: IC_CERTIFICATE_KEYS,
										template: IC_CERTIFICATE_TEMPLATE,
										withDesign: true,
										withSignature: true,
										qrCode,
									});
								}, "pdf-design")
							}
						>
							<span>دانلود {fileName} قالب PDF (با سربرگ)</span>
						</Button>

						<Spinner loading={status === "pdf-design"} size="xs" />
					</ActionItem>
				)}

				<ActionItem>
					<Button
						disabled={!!status}
						type="button"
						variant="link"
						onClick={() =>
							doAction(async () => {
								downloadCertificateWord(instance);
							}, "word")
						}
					>
						<span>دانلود {fileName} قالب Word (بدون سربرگ)</span>
					</Button>

					<Spinner loading={status === "word"} size="xs" />
				</ActionItem>
			</div>
		</div>
	);
}

export { CertificatePage };
