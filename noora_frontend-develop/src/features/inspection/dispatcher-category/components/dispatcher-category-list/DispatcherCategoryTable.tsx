"use client";

import dynamic from "next/dynamic";
import { Fragment } from "react";
import {
	FaEllipsis,
	FaMagnifyingGlassArrowRight,
	FaPenToSquare,
	FaThumbsDown,
	FaThumbsUp,
	FaTrash,
} from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { useDialogs } from "@/components/ui/dialog/use-dialogs";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Numeric } from "@/components/ui/numeric";
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

import { dispatcherCategoryTypes } from "../../enums/DispatcherCategoryType";
import { DispatcherCategory } from "../../models/DispatcherCategory";
import { stripCaretSymbol } from "../../utils/stripCaretSymbol";

const DispatcherCategoryCompanyCheckDialog = dynamic(
	() =>
		import(
			"../dispatcher-category-company-check/DispatcherCategoryCompanyCheckDialog"
		),
);

const DispatcherCategoryCompanyRemoveDialog = dynamic(
	() =>
		import(
			"../dispatcher-category-company-remove/DispatcherCategoryCompanyRemoveDialog"
		),
);

function DispatcherCategoryTable({
	items,
	companyDomainCodes,
	loading,
	error,
	offset,
	pagination,
	onChange,
	onItemEdit,
	onItemDelete,
}: {
	items?: DispatcherCategory[];
	companyDomainCodes?: string[];
	loading: boolean;
	error: string | null;
	offset: number;
	pagination: React.ReactNode;
	onChange: () => void;
	onItemEdit: (category: DispatcherCategory) => Promise<void>;
	onItemDelete: (category: DispatcherCategory) => Promise<void>;
}) {
	const dialogs = useDialogs();

	return (
		<CardContent className="px-0">
			<Table
				loading={loading}
				pagination={pagination}
				slotProps={{ root: { className: "rounded-none border-x-0" } }}
			>
				<TableHeader>
					<TableRow className="whitespace-nowrap">
						<TableHead className="w-16">#</TableHead>
						<TableHead className="w-48">دسته بندی</TableHead>
						<TableHead className="w-48">کد دامنه</TableHead>
						<TableHead className="w-80">دامنه بازرسی</TableHead>
						<TableHead>محدوده بازرسی</TableHead>
						<TableHead className="w-28">عملیات</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{!!items?.length ? (
						items.map((category, index) => {
							const isActiveForCompany = companyDomainCodes?.some(
								(domainCode) => domainCode === category.domainCode,
							);

							const scopes = category.include.map((x) => ({
								include: stripCaretSymbol(x),
								exclude: category.exclude
									.filter((y) => y.startsWith(x))
									.map(stripCaretSymbol),
							}));

							const canCheck = typeof isActiveForCompany === "undefined";
							const canRemoveCompany =
								typeof isActiveForCompany === "boolean" && isActiveForCompany;
							const canDelete = typeof isActiveForCompany === "undefined";

							const hasMoreActions = canCheck || canRemoveCompany || canDelete;

							return (
								<TableRow key={category._id} className="whitespace-nowrap">
									<TableCell>
										<Numeric value={offset + index + 1} />
									</TableCell>

									<TableCell>
										{dispatcherCategoryTypes[category.type].title}
									</TableCell>

									<TableCell>
										<Numeric value={category.domainCode} />
									</TableCell>

									<TableCell>{category.inspectionDomain}</TableCell>

									<TableCell>
										{!!scopes.length ? (
											<div className="inline-flex min-w-72 flex-wrap whitespace-normal leading-6">
												{scopes.map(({ include, exclude }, index) => (
													<Fragment key={index}>
														کد&nbsp;
														<Numeric value={include} />
														{!!exclude.length && (
															<>
																&nbsp;(به استثنای&nbsp;
																{exclude.map((x, i) => (
																	<>
																		<Numeric value={x} />
																		{i < exclude.length - 1 && <>،&nbsp;</>}
																	</>
																))}
																)
															</>
														)}
														{index !== scopes.length - 1 && (
															<>&nbsp;&nbsp;-&nbsp;&nbsp;</>
														)}
													</Fragment>
												))}
											</div>
										) : (
											"-"
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
																variant="link"
																type="button"
																onClick={onItemEdit.bind(null, category)}
															>
																<FaPenToSquare />
															</Button>
														</TooltipTrigger>
														<TooltipContent>ویرایش گروه کالایی</TooltipContent>
													</TableAction>
												</Tooltip>

												{hasMoreActions && (
													<TableAction>
														<DropdownMenu>
															<DropdownMenuTrigger asChild>
																<Button
																	className="size-full"
																	size="icon"
																	type="button"
																	variant="link"
																>
																	<FaEllipsis />
																</Button>
															</DropdownMenuTrigger>

															<DropdownMenuContent
																className="min-w-32"
																side="right"
															>
																{canCheck && (
																	<DropdownMenuItem
																		className="flex items-center gap-2"
																		onSelect={async () => {
																			await dialogs.open(
																				DispatcherCategoryCompanyCheckDialog,
																				{ category },
																			);
																		}}
																	>
																		<div className="flex grow items-center gap-2">
																			<FaMagnifyingGlassArrowRight />
																			<span>وضعیت گروه کالایی در سازمان</span>
																		</div>
																	</DropdownMenuItem>
																)}

																{canRemoveCompany && (
																	<DropdownMenuItem
																		className="flex items-center gap-2"
																		onSelect={async () => {
																			const result = await dialogs.open(
																				DispatcherCategoryCompanyRemoveDialog,
																				{ category },
																			);

																			if (result) {
																				onChange();
																			}
																		}}
																	>
																		<div className="flex grow items-center gap-2">
																			<FaThumbsDown />
																			<span>
																				غیرفعال گروه کالایی برای سازمان
																			</span>
																		</div>
																	</DropdownMenuItem>
																)}

																{canDelete && (
																	<DropdownMenuItem
																		className="flex items-center gap-2"
																		onSelect={() => {
																			onItemDelete(category);
																		}}
																	>
																		<div className="flex grow items-center gap-2">
																			<FaTrash />
																			<span>حذف گروه کالایی</span>
																		</div>
																	</DropdownMenuItem>
																)}
															</DropdownMenuContent>
														</DropdownMenu>
													</TableAction>
												)}
											</TableActions>
										</TooltipProvider>
									</TableCell>
								</TableRow>
							);
						})
					) : (
						<TableRow>
							<TableCell colSpan={100}>هیچ موردی یافت نشد.</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</CardContent>
	);
}

function ItemCompanyAddButton() {}

export { DispatcherCategoryTable };
