"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import {
	FaBan,
	FaPenToSquare,
	FaPlus,
	FaTag,
	FaTrash,
} from "react-icons/fa6";
import { toast } from "sonner";

import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardNav,
	CardTitle,
} from "@/components/ui/card";
import { useDialogs } from "@/components/ui/dialog/use-dialogs";
import { Input } from "@/components/ui/input";
import { Numeric } from "@/components/ui/numeric";
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
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { toCurrency } from "@/utils/String";

import { SamplingPrice, samplingProcesses } from "../models/SamplingPrice";
import { getSamplingPrices } from "../services/getSamplingPrices";
import {
	getSamplingIncomeCategory,
	SamplingIncomeCategory,
	upsertSamplingIncomeCategory,
} from "../services/samplingIncomeCategory";
import { removeSamplingPriceVersion } from "../services/upsertSamplingPrice";
import { getPriceVersions, isoToJalali } from "../utils/samplingPriceDates";

const SamplingPriceUpsertDialog = dynamic(
	() => import("./SamplingPriceUpsertDialog"),
);
const SamplingPriceVersionDialog = dynamic(
	() => import("./SamplingPriceVersionDialog"),
);
const SamplingPriceDeprecateDialog = dynamic(
	() => import("./SamplingPriceDeprecateDialog"),
);

/** admin tab «قیمت گذاری»: sampling income category and dated service prices */
function SamplingPricingPage() {
	return (
		<div className="space-y-6">
			<SamplingIncomeCategoryCard />
			<SamplingPriceList />
		</div>
	);
}

function SamplingIncomeCategoryCard() {
	const [category, setCategory] = useState<SamplingIncomeCategory | null>();
	const [title, setTitle] = useState<string>("");
	const [isSaving, setSaving] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		(async () => {
			try {
				const category = await getSamplingIncomeCategory();
				setCategory(category);
				setTitle(category?.title ?? "نمونه برداری");
			} catch {
				setError("خطایی در دریافت عنوان درآمدی رخ داد.");
			}
		})();
	}, []);

	async function save() {
		try {
			setSaving(true);
			setError(null);
			const saved = await upsertSamplingIncomeCategory(title.trim());
			setCategory(saved);
			toast.success(
				category
					? "عنوان درآمدی بروزرسانی شد."
					: "عنوان درآمدی نمونه‌برداری ساخته شد.",
			);
		} catch {
			setError("خطای نامشخصی در هنگام ثبت اطلاعات رخ داد.");
		} finally {
			setSaving(false);
		}
	}

	return (
		<Card>
			<CardHeader orientation="horizontal">
				<CardTitle>عنوان درآمدی نمونه‌برداری</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<p className="text-muted-foreground">
					مبلغ نمونه‌برداری پس از تایید نمونه‌بردار، با این عنوان در درآمدهای
					پرونده ثبت می‌شود.
				</p>

				{typeof category === "undefined" && !error ? (
					<Spinner loading size="sm" />
				) : (
					<div className="flex max-w-xl items-center gap-3">
						<Input
							value={title}
							onChange={(event) => setTitle(event.target.value)}
						/>
						<Button
							className="min-w-28 shrink-0"
							disabled={
								isSaving || !title.trim() || title.trim() === category?.title
							}
							type="button"
							variant="primary"
							onClick={save}
						>
							<Spinner loading={isSaving} size="sm">
								{category ? "ذخیره عنوان" : "ساخت عنوان درآمدی"}
							</Spinner>
						</Button>
						{!category && <Badge variant="destructive">تعریف نشده</Badge>}
					</div>
				)}

				{error && (
					<DestructiveAlert>
						<AlertDescription>{error}</AlertDescription>
					</DestructiveAlert>
				)}
			</CardContent>
		</Card>
	);
}

function SamplingPriceList() {
	const dialogs = useDialogs();

	const [items, setItems] = useState<SamplingPrice[]>([]);
	const [isLoading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	const load = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			setItems(await getSamplingPrices());
		} catch {
			setError("خطایی در دریافت انواع خدمت رخ داد.");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		load();
	}, [load]);

	async function openDialog(dialog: any, payload: object) {
		const result = await dialogs.open(dialog, payload);
		if (result) {
			load();
		}
	}

	async function removeVersion(service: SamplingPrice, priceId: string) {
		try {
			await removeSamplingPriceVersion(service.id, priceId);
			toast.success("قیمت حذف شد.");
			load();
		} catch {
			toast.error("حذف قیمت با خطا روبرو شد.");
		}
	}

	const now = new Date();

	return (
		<Card>
			<CardHeader orientation="horizontal">
				<CardTitle>انواع خدمت و قیمت‌ها</CardTitle>
				<CardNav>
					<Button
						disabled={isLoading}
						type="button"
						variant="primary"
						onClick={() => openDialog(SamplingPriceUpsertDialog, {})}
					>
						<FaPlus />
						<span>افزودن نوع خدمت</span>
					</Button>
				</CardNav>
			</CardHeader>

			<CardContent className="px-0">
				{error && (
					<DestructiveAlert className="mx-6 mb-4">
						<AlertDescription>{error}</AlertDescription>
					</DestructiveAlert>
				)}

				<Table
					loading={isLoading}
					slotProps={{ root: { className: "rounded-none border-x-0" } }}
				>
					<TableHeader>
						<TableRow className="whitespace-nowrap">
							<TableHead className="w-16">#</TableHead>
							<TableHead>عنوان خدمت</TableHead>
							<TableHead>فرایندها</TableHead>
							<TableHead>قیمت فعلی هر نمونه</TableHead>
							<TableHead>سابقه و قیمت‌های اعلام‌شده</TableHead>
							<TableHead className="w-28">وضعیت</TableHead>
							<TableHead className="w-36">عملیات</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{items.length ? (
							items.map((service, index) => {
								const { current } = getPriceVersions(service, now);
								const isDeprecated =
									!!service.deprecatedFrom &&
									new Date(service.deprecatedFrom) <= now;
								const versions = [...service.prices].sort(
									(a, b) =>
										new Date(b.effectiveFrom).getTime() -
										new Date(a.effectiveFrom).getTime(),
								);

								return (
									<TableRow key={service.id} className="align-top">
										<TableCell>
											<Numeric value={index + 1} />
										</TableCell>

										<TableCell className="whitespace-nowrap">
											{service.title}
										</TableCell>

										<TableCell>
											{service.processKeys.length
												? service.processKeys
														.map(
															(key) =>
																samplingProcesses.find((x) => x.value === key)
																	?.label ?? key,
														)
														.join("، ")
												: "همه فرایندها"}
										</TableCell>

										<TableCell className="whitespace-nowrap">
											{current
												? `${toCurrency(current.price.toString())} ریال`
												: "هنوز اعمال نشده"}
										</TableCell>

										<TableCell>
											<div className="space-y-1">
												{versions.map((version) => {
													const from = new Date(version.effectiveFrom);
													const label =
														version.id === current?.id
															? "جاری"
															: from > now
																? "آینده"
																: "سابق";

													return (
														<div
															key={version.id}
															className="flex items-center gap-2 whitespace-nowrap"
														>
															<Badge
																variant={
																	label === "جاری" ? "default" : "outline"
																}
															>
																{label}
															</Badge>
															<span>
																{toCurrency(version.price.toString())} ریال از{" "}
																<Numeric value={isoToJalali(version.effectiveFrom)} />
															</span>
															{version.note && (
																<span className="text-muted-foreground">
																	({version.note})
																</span>
															)}
															{versions.length > 1 && (
																<button
																	className="text-muted-foreground hover:text-red-600"
																	title="حذف این قیمت"
																	type="button"
																	onClick={() =>
																		removeVersion(service, version.id)
																	}
																>
																	<FaTrash size={11} />
																</button>
															)}
														</div>
													);
												})}
											</div>
										</TableCell>

										<TableCell className="whitespace-nowrap">
											{service.deprecatedFrom ? (
												<Badge variant={isDeprecated ? "destructive" : "outline"}>
													{isDeprecated ? "منسوخ از" : "منسوخ می‌شود از"}{" "}
													{isoToJalali(service.deprecatedFrom)}
												</Badge>
											) : (
												<Badge variant="secondary">فعال</Badge>
											)}
										</TableCell>

										<TableCell>
											<TooltipProvider>
												<TableActions>
													<Tooltip>
														<TableAction>
															<TooltipTrigger asChild>
																<Button
																	className="size-full"
																	size="icon"
																	type="button"
																	variant="link"
																	onClick={() =>
																		openDialog(SamplingPriceVersionDialog, {
																			service,
																		})
																	}
																>
																	<FaTag />
																</Button>
															</TooltipTrigger>
															<TooltipContent>اعلام قیمت جدید</TooltipContent>
														</TableAction>
													</Tooltip>

													<Tooltip>
														<TableAction>
															<TooltipTrigger asChild>
																<Button
																	className="size-full"
																	size="icon"
																	type="button"
																	variant="link"
																	onClick={() =>
																		openDialog(SamplingPriceUpsertDialog, {
																			service,
																		})
																	}
																>
																	<FaPenToSquare />
																</Button>
															</TooltipTrigger>
															<TooltipContent>ویرایش نوع خدمت</TooltipContent>
														</TableAction>
													</Tooltip>

													<Tooltip>
														<TableAction>
															<TooltipTrigger asChild>
																<Button
																	className="size-full"
																	size="icon"
																	type="button"
																	variant="link"
																	onClick={() =>
																		openDialog(SamplingPriceDeprecateDialog, {
																			service,
																		})
																	}
																>
																	<FaBan />
																</Button>
															</TooltipTrigger>
															<TooltipContent>منسوخ کردن / فعال‌سازی</TooltipContent>
														</TableAction>
													</Tooltip>
												</TableActions>
											</TooltipProvider>
										</TableCell>
									</TableRow>
								);
							})
						) : (
							<TableRow>
								<TableCell colSpan={100}>
									{isLoading ? "" : "هنوز نوع خدمتی تعریف نشده است."}
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}

export { SamplingPricingPage };
