"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { FaCheck } from "react-icons/fa6";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { DialogProps, useDialogs } from "@/components/ui/dialog/use-dialogs";
import { Numeric } from "@/components/ui/numeric";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

import { DispatcherCategory } from "../../models/DispatcherCategory";
import { addCompanyDispatcherCategory } from "../../services/addCompanyDispatcherCategory";
import { checkCompanyDispatcherCategoryByDomainCode } from "../../services/checkCompanyDispatcherCategoryByDomainCode";

const DispatcherCategoryCompanyRemoveDialog = dynamic(
	() =>
		import(
			"../dispatcher-category-company-remove/DispatcherCategoryCompanyRemoveDialog"
		),
);

function DispatcherCategoryCompanyCheckDialog({
	payload: { category },
	open,
	onClose,
}: DialogProps<{
	category: DispatcherCategory;
}>) {
	const dialogs = useDialogs();

	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [result, setResult] = useState<"active" | "deactive">();

	useEffect(() => {
		const queryFn = async () => {
			try {
				setIsLoading(true);

				const result = await checkCompanyDispatcherCategoryByDomainCode(
					category.domainCode,
				);

				setResult(result ? "active" : "deactive");
			} catch {
			} finally {
				setIsLoading(false);
			}
		};

		queryFn();
	}, [category.domainCode]);

	const [isPending, setIsPending] = useState<boolean>(false);

	async function handleAdd() {
		try {
			setIsPending(true);

			await addCompanyDispatcherCategory(category.domainCode);

			toast.success("گروه کالای مورد نظر با موفقیت در سازمان فعال شد.");

			onClose();
		} catch {
			toast.error(
				"خطای نامشخصی در هنگام فعال کردن گروه کالایی برای سازمان رخ داد.",
			);
		} finally {
			setIsPending(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={onClose.bind(null, undefined)}>
			<DialogContent
				aria-describedby={undefined}
				className="max-w-screen-xs"
				onInteractOutside={(event) => {
					if (isPending) {
						event.preventDefault();
					}
				}}
			>
				<DialogHeader>
					<DialogTitle>وضعیت گروه کالایی در سازمان</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col items-start gap-2">
					<span className="leading-6">
						وضعیت گروه کالایی با کد «<Numeric value={category.domainCode} />» و
						دامنه بازرسی «{category.inspectionDomain}» در سازمان:
					</span>

					{isLoading && (
						<Spinner
							className="text-muted-foreground"
							label="در حال بررسی..."
							size="sm"
						/>
					)}

					{!isLoading && (
						<Badge
							className={cn(
								result === "active" && "bg-green-100 text-green-900",
								result === "deactive" && "bg-red-100 text-red-900",
							)}
						>
							{result === "active" && (
								<>
									<FaCheck />
									فعال
								</>
							)}

							{result === "deactive" && (
								<>
									<FaCheck />
									غیرفعال
								</>
							)}
						</Badge>
					)}
				</div>

				{result && (
					<DialogFooter>
						{result === "deactive" && (
							<Button
								className="min-w-24"
								disabled={isPending}
								type="button"
								variant="primary"
								onClick={handleAdd}
							>
								<Spinner loading={isPending} size="sm">
									فعال کردن گروه کالایی برای سازمان
								</Spinner>
							</Button>
						)}

						{result === "active" && (
							<Button
								className="min-w-24"
								disabled={isPending}
								type="button"
								variant="ghost"
								onClick={async () => {
									const result = await dialogs.open(
										DispatcherCategoryCompanyRemoveDialog,
										{ category },
									);

									if (result) {
										onClose(undefined);
									}
								}}
							>
								<Spinner loading={isPending} size="sm">
									غیرفعال کردن گروه کالایی برای سازمان
								</Spinner>
							</Button>
						)}

						<DialogTrigger asChild>
							<Button disabled={isPending} type="button" variant="ghost">
								بازگشت
							</Button>
						</DialogTrigger>
					</DialogFooter>
				)}
			</DialogContent>
		</Dialog>
	);
}

export default DispatcherCategoryCompanyCheckDialog;
