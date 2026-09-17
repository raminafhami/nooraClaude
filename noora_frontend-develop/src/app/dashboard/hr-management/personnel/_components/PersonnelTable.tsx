"use client";

import { useMemo, useState } from "react";
import { FaAngleLeft, FaEye, FaRegCreditCard } from "react-icons/fa6";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { Button, buttonVariants } from "@/components/ui/button";
import { DynamicLink } from "@/components/ui/dynamic-link";
import { Numeric } from "@/components/ui/numeric";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
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
import { Personnel } from "@/hrm/personnel/models/Personnel";
import { cn } from "@/lib/utils";
import { asNavigationProp } from "@/utils/asNavigationProp";

import ManageCreditModal from "./modal/ManageCreditModal";

const JOBS_CELL_LIMIT = 2;

function PersonnelTable({
	personnel,
	loading,
	error,
	offset,
	Pagination,
}: {
	personnel: Personnel[] | undefined;
	loading: boolean;
	error: string | null;
	offset: number;
	Pagination: React.ReactNode;
}) {
	const { identity, isAuthorized } = useLoggedInUser();

	const canManageCredit = useMemo(
		() => isAuthorized({ groups: ["credit-manager"] }),
		[isAuthorized],
	);

	const [userData, setUserData] = useState<Personnel>();
	const [showCreditModal, setShowCreditModal] = useState<boolean>(false);

	return (
		<>
			{showCreditModal && userData && (
				<ManageCreditModal
					data={userData}
					setShow={setShowCreditModal}
					isShow={showCreditModal}
				/>
			)}

			<Table
				loading={loading}
				pagination={Pagination}
				slotProps={{
					root: { className: "rounded-none border-x-0" },
				}}
			>
				<TableHeader>
					<TableRow className="whitespace-nowrap">
						<TableHead className="w-16">#</TableHead>
						<TableHead className="w-64">نام</TableHead>
						<TableHead className="w-36">کد ملی</TableHead>
						<TableHead className="w-36">شماره همراه</TableHead>
						<TableHead className="w-72">پست الکترونیک</TableHead>
						<TableHead>شغل</TableHead>
						<TableHead className="w-28">عملیات</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{!!personnel?.length ? (
						personnel.map((person, index) => (
							<TableRow key={person.id} className="whitespace-nowrap">
								<TableCell>{offset + index + 1}</TableCell>

								<TableCell>
									<DynamicLink
										href={`/dashboard/hr-management/personnel/${person.userId}`}
									>
										{person.fullname}
									</DynamicLink>
								</TableCell>

								<TableCell>
									<Numeric value={person.nationalCode} placeholder="-" />
								</TableCell>

								<TableCell>
									<Numeric value={person.phoneNo} placeholder="-" />
								</TableCell>

								<TableCell>{person.email || "-"}</TableCell>

								<TableCell>
									{!!person.jobs.length ? (
										<div className="min-w-80 space-y-1.5 whitespace-normal">
											{asNavigationProp(person.jobs)
												.slice(0, JOBS_CELL_LIMIT)
												.map((job) => (
													<div key={job.id} className="flex gap-1">
														<div className="flex size-5 items-center justify-center">
															<FaAngleLeft size={10} />
														</div>

														<div>
															<div>{job.name}</div>
															{job.metadata?.goodsInspectionField && (
																<div className="text-muted-foreground">
																	{job.metadata?.goodsInspectionField}
																</div>
															)}
														</div>
													</div>
												))}

											{person.jobs.length > JOBS_CELL_LIMIT && (
												<Popover>
													<PopoverTrigger asChild>
														<button className="ms-4 h-auto p-0">
															موارد بیشتر...
														</button>
													</PopoverTrigger>

													<PopoverContent className="mr-48 !w-72 space-y-2">
														{asNavigationProp(person.jobs)
															.slice(JOBS_CELL_LIMIT)
															.map((job) => (
																<div key={job.id} className="flex gap-1">
																	<div className="flex size-5 items-center justify-center">
																		<FaAngleLeft size={10} />
																	</div>

																	<div>
																		<div>{job.name}</div>
																		{job.metadata?.goodsInspectionField && (
																			<div className="text-muted-foreground">
																				{job.metadata?.goodsInspectionField}
																			</div>
																		)}
																	</div>
																</div>
															))}
													</PopoverContent>
												</Popover>
											)}
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
														<DynamicLink
															className={cn(
																buttonVariants({
																	size: "icon",
																	variant: "link",
																}),
																"size-full",
															)}
															href={`/dashboard/hr-management/personnel/${person.userId}`}
														>
															<FaEye />
														</DynamicLink>
													</TooltipTrigger>
													<TooltipContent>مشاهده پرسنل</TooltipContent>
												</TableAction>
											</Tooltip>

											{canManageCredit && (
												<Tooltip>
													<TableAction>
														<TooltipTrigger asChild>
															<Button
																className="size-full"
																size="icon"
																type="button"
																variant="link"
																onClick={() => {
																	setUserData(person);
																	setShowCreditModal(true);
																}}
															>
																<FaRegCreditCard />
															</Button>
														</TooltipTrigger>
														<TooltipContent>مدیریت اعتبار پرسنل</TooltipContent>
													</TableAction>
												</Tooltip>
											)}
										</TableActions>
									</TooltipProvider>
								</TableCell>
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={100}>هیچ موردی یافت نشد.</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</>
	);
}

export { PersonnelTable };
