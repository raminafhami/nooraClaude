"use client";

import moment from "jalali-moment";
import {
	FaEllipsis,
	FaFile,
	FaPenToSquare,
	FaPrescriptionBottle,
	FaTrash,
	FaUserTag,
	FaWrench,
} from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { PropertyStatus } from "@/property/enums/PropertyStatus";
import { Property } from "@/property/models/Property";
import { asNavigationProp } from "@/utils/asNavigationProp";
import { toCurrency } from "@/utils/String";

import { PropertyStatusBadge } from "../PropertyStatusBadge";

const PropertyTable = ({
	items,
	isLoading,
	offset,
	pagination,
	onItemEdit,
	onItemFiles,
	onItemAssignToUser,
	onItemUnassignUser,
	onItemRepair,
	onItemDecomission,
	onItemDelete,
}: {
	items: Property[] | undefined;
	isLoading: boolean;
	offset: number;
	pagination: React.ReactNode;

	onItemView: (property: Property) => Promise<void>;
	onItemEdit: (property: Property) => Promise<void>;
	onItemFiles: (property: Property) => Promise<void>;
	onItemAssignToUser: (property: Property) => Promise<void>;
	onItemUnassignUser: (property: Property) => Promise<void>;
	onItemRepair: (property: Property) => Promise<void>;
	onItemDecomission: (property: Property) => Promise<void>;
	onItemDelete: (property: Property) => Promise<void>;
}) => {
	return (
		<Table
			loading={isLoading}
			pagination={pagination}
			slotProps={{
				root: { className: "w-full rounded-none border-x-0" },
			}}
		>
			<TableHeader>
				<TableRow>
					<TableHead className="w-12">#</TableHead>
					<TableHead>نام کالا</TableHead>
					<TableHead className="w-36">مدل کالا</TableHead>
					<TableHead className="w-44">دسته بندی</TableHead>
					<TableHead className="w-36">شماره کالا</TableHead>
					<TableHead className="w-44">کاربر</TableHead>
					<TableHead className="w-36">سازنده</TableHead>
					<TableHead className="w-44">شماره سریال</TableHead>
					<TableHead className="w-36">قیمت خرید(ریال)</TableHead>
					<TableHead className="w-36">تاریخ خرید</TableHead>
					<TableHead className="w-28">ارزش(ریال)</TableHead>
					<TableHead className="w-32">شماره بیمه</TableHead>
					<TableHead className="w-24">وضعیت</TableHead>
					<TableHead className="w-16">عملیات</TableHead>
				</TableRow>
			</TableHeader>

			<TableBody>
				{items?.map((item, index) => (
					<TableRow key={item.id}>
						<TableCell>{offset + index + 1}</TableCell>
						<TableCell>{item.type}</TableCell>
						<TableCell>{item.model || "-"}</TableCell>
						<TableCell>{item.category || "-"}</TableCell>
						<TableCell>{item.propertyNo}</TableCell>
						<TableCell>
							{typeof item.assignmentHistory.at(-1)?.userId === "object" &&
							item.assignedUser !== null
								? `${asNavigationProp(item.assignmentHistory.at(-1)?.userId)?.name} ${asNavigationProp(item.assignmentHistory.at(-1)?.userId)?.lastname}`
								: "-"}
						</TableCell>
						<TableCell>{item.manufacturer || "-"}</TableCell>
						<TableCell>{item.serialNumber}</TableCell>
						<TableCell>
							{toCurrency(String(item.purchasePrice || "-"))}
						</TableCell>
						<TableCell>
							{moment(item.purchaseDate).format("jYYYY/jMM/jDD")}
						</TableCell>
						<TableCell>
							{toCurrency(String(item.currentValue || "-"))}
						</TableCell>
						<TableCell>{item.insurancePolicyNumber || "-"}</TableCell>
						<TableCell>
							<PropertyStatusBadge property={item} />
						</TableCell>
						<TableCell>
							<TooltipProvider>
								<TableActions>
									<TableAction>
										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													onClick={onItemEdit.bind(null, item)}
													size="icon"
													variant="ghost"
												>
													<FaPenToSquare />
												</Button>
											</TooltipTrigger>
											<TooltipContent>ویرایش</TooltipContent>
										</Tooltip>
									</TableAction>

									<TableAction>
										<DropdownMenu>
											<DropdownMenuTrigger className="h-full">
												<FaEllipsis />
											</DropdownMenuTrigger>
											<DropdownMenuContent className="min-w-40">
												{item.status !== PropertyStatus.Decommissioned && (
													<>
														{/* <DropdownMenuItem
															className="flex items-center gap-2"
															onSelect={() =>
																handlePropertyDetailDialog(item, true)
															}
														>
															<FaPen />
															<span>ویرایش</span>
														</DropdownMenuItem> */}
														<DropdownMenuItem
															className="flex items-center gap-2"
															onSelect={onItemFiles.bind(null, item)}
														>
															<FaFile />
															<span>فایل ها</span>
														</DropdownMenuItem>
														<DropdownMenuItem
															className="flex items-center gap-2"
															onSelect={onItemAssignToUser.bind(null, item)}
														>
															<FaUserTag />
															<span>تحویل به کاربر</span>
														</DropdownMenuItem>

														{item.assignedUser !== null && (
															<DropdownMenuItem
																className="flex items-center gap-2"
																onSelect={onItemUnassignUser.bind(null, item)}
															>
																<FaUserTag />
																<span>بازپس‌گیری کالا از کاربر</span>
															</DropdownMenuItem>
														)}

														<DropdownMenuItem
															className="flex items-center gap-2"
															onSelect={onItemRepair.bind(null, item)}
														>
															<FaWrench />
															<span>تعمیر</span>
														</DropdownMenuItem>

														<DropdownMenuItem
															className="flex items-center gap-2"
															onSelect={onItemDecomission.bind(null, item)}
														>
															<FaPrescriptionBottle />
															<span>اسقاط</span>
														</DropdownMenuItem>
													</>
												)}

												{/* <DropdownMenuItem
													className="flex items-center gap-2"
													onSelect={() =>
														handlePropertyMaintenanceDialog(
															item.id,
															item.maintenanceHistory,
														)
													}
												>
													<FaArrowRight />
													<span>تحویل برای نگهداری</span>
												</DropdownMenuItem> */}

												<DropdownMenuItem
													className="flex items-center gap-2 text-red-600"
													onSelect={onItemDelete.bind(null, item)}
												>
													<FaTrash />
													<span>حذف کالا</span>
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableAction>
								</TableActions>
							</TooltipProvider>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
};

export { PropertyTable };
