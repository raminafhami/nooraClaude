"use client";

import { memo } from "react";
import { FaHourglass, FaPenToSquare, FaRotate, FaTrash } from "react-icons/fa6";
import { toast } from "sonner";

import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Indicator } from "@/indicator/models/Indicator";
import { deleteIndicator } from "@/indicator/services/deleteIndicator";

interface Props {
	indicators: Indicator[];
	editingIndicator: Indicator | null;
	loading: boolean;
	errorMessage: string | null;
	refreshFn: () => Promise<void>;
	onEdit: (indicator: Indicator) => void;
}

function IndicatorsTable({
	indicators,
	editingIndicator,
	loading: isLoading,
	errorMessage,
	refreshFn,
	onEdit: handleEdit,
}: Props) {
	async function handleRemove(id: string) {
		try {
			await deleteIndicator(id);
			toast.success("حذف شمارنده مورد نظر با موفقیت انجام شد.");
		} catch (err) {
			console.error(err);
			toast.error("خطای نامشخصی در هنگام حذف شمارنده مورد نظر رخ داد.");
		}
	}

	return (
		<div>
			<Card>
				<CardHeader>
					<CardTitle>
						<span>لیست شمارنده ها</span>

						<Button
							className="flex w-fit items-center justify-center border-none px-0"
							disabled={isLoading}
							variant="link"
							onClick={async () => await refreshFn()}
						>
							{isLoading ? <Spinner size="xs" /> : <FaRotate />}
						</Button>
					</CardTitle>
				</CardHeader>

				<div className="space-y-4">
					{errorMessage && (
						<CardContent>
							<DestructiveAlert className="max-w-fit">
								<AlertDescription>{errorMessage}</AlertDescription>
							</DestructiveAlert>
						</CardContent>
					)}

					<CardContent className="px-0">
						<Table
							slotProps={{ root: { className: "rounded-none border-x-0" } }}
						>
							<TableHeader>
								<TableRow>
									<TableHead className="w-20"></TableHead>
									<TableHead className="w-14">ردیف</TableHead>
									<TableHead>عنوان</TableHead>
									<TableHead className="w-56">کلیدواژه</TableHead>
									<TableHead className="w-48">ساختار</TableHead>
									<TableHead className="w-36">آخرین شماره</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{indicators.length > 0 &&
									indicators.map((indicator, index) => {
										const showActions = indicator.id !== editingIndicator?.id;

										return (
											<TableRow key={indicator.id}>
												<TableCell>
													<TableActions>
														{showActions ? (
															<>
																<TableAction
																	className="hover:text-yellow-500"
																	title="ویرایش شمارنده"
																	onClick={async () => handleEdit(indicator)}
																>
																	<FaPenToSquare />
																</TableAction>

																<TableAction
																	className="hover:text-red-500"
																	title="حذف شمارنده"
																	onClick={async () => {
																		await handleRemove(indicator.id);
																		refreshFn();
																	}}
																>
																	<FaTrash />
																</TableAction>
															</>
														) : (
															<TableAction
																className="cursor-default"
																title="در حال ویرایش"
															>
																<FaHourglass />
															</TableAction>
														)}
													</TableActions>
												</TableCell>
												<TableCell className="text-center">
													{index + 1}
												</TableCell>
												<TableCell>{indicator.title}</TableCell>
												<TableCell>{indicator.key}</TableCell>
												<TableCell>
													<span dir="ltr" className="text-right">
														{indicator.format.replace("${counter}", "#")}
													</span>
												</TableCell>
												<TableCell>{indicator.counter}</TableCell>
											</TableRow>
										);
									})}
							</TableBody>
						</Table>
					</CardContent>
				</div>
			</Card>
		</div>
	);
}

const PureIndicatorsTable = memo(IndicatorsTable);

export { PureIndicatorsTable as IndicatorsTable };
