"use client";

import { useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useState } from "react";
import { FaUserCog } from "react-icons/fa";
import { FaEye, FaPencil, FaRotate } from "react-icons/fa6";

import { Branch } from "@/branches/models/Branch";
import { getBranches } from "@/branches/services/getBranches";
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
import { getDynamicUrl } from "@/utils/url/getDynamicUrl";

interface Props {
	branches: Branch[];
	onBranchesFetch: (branches: Branch[]) => void;
	onBranchEdit: (branch: Branch) => void;
	onManagerChanage: (branch: Branch) => void;
}

export const BranchesTable = memo(function BranchesTable({
	branches,
	onBranchesFetch,
	onBranchEdit,
	onManagerChanage,
}: Props) {
	const router = useRouter();

	const [isLoading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	const loadBranches = useCallback(async (): Promise<void> => {
		try {
			setLoading(true);

			const branches = await getBranches({ sort: { title: "asc" } });

			setError(null);
			onBranchesFetch(branches);
		} catch (err: any) {
			setError(err?.message || "خطایی در دریافت اطلاعات رخ داد.");
		} finally {
			setLoading(false);
		}
	}, [onBranchesFetch]);

	useEffect(() => {
		loadBranches();
	}, [loadBranches]);

	return (
		<div>
			<Card>
				<CardHeader>
					<CardTitle>
						<span>لیست شعبه ها</span>
						{(branches.length > 0 || error) && (
							<Button
								className="px-0"
								disabled={isLoading}
								variant="link"
								onClick={loadBranches}
							>
								{isLoading ? <Spinner size="xs" /> : <FaRotate />}
							</Button>
						)}
					</CardTitle>
				</CardHeader>

				{branches.length > 0 || (!isLoading && !error) ? (
					<CardContent className="px-0">
						<Table
							slotProps={{ root: { className: "rounded-none border-x-0" } }}
						>
							<TableHeader>
								<TableRow>
									<TableHead className="w-20"></TableHead>
									<TableHead className="w-14">ردیف</TableHead>
									<TableHead>نام</TableHead>
									<TableHead>کلیدواژه</TableHead>
									<TableHead>مدیر شعبه</TableHead>
									<TableHead>شماره همراه</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{branches.length > 0 &&
									branches.map((branch: Branch, index: number) => (
										<TableRow key={branch.id}>
											<TableCell>
												<TableActions>
													<TableAction
														className="hover:text-blue-500"
														onClick={() =>
															router.push(
																getDynamicUrl(
																	`/dashboard/admin/branches/${branch.id}`,
																),
															)
														}
													>
														<FaEye />
													</TableAction>

													<TableAction
														className="hover:text-yellow-500"
														onClick={() => onBranchEdit(branch)}
													>
														<FaPencil />
													</TableAction>

													<TableAction
														className="hover:text-blue-500"
														onClick={() => onManagerChanage(branch)}
													>
														<FaUserCog />
													</TableAction>
												</TableActions>
											</TableCell>
											<TableCell className="w-12 text-center">
												{index + 1}
											</TableCell>
											<TableCell>{branch.title}</TableCell>
											<TableCell>{branch.name}</TableCell>
											<TableCell>{branch.manager?.fullname || "-"}</TableCell>
											<TableCell>
												{branch.manager?.phoneNo ? (
													<span className="text-xs tracking-wider">
														{branch.manager.phoneNo}
													</span>
												) : (
													"-"
												)}
											</TableCell>
										</TableRow>
									))}
							</TableBody>
						</Table>
					</CardContent>
				) : (
					<CardContent>
						{error ? (
							<DestructiveAlert>
								<AlertDescription>{error}</AlertDescription>
							</DestructiveAlert>
						) : (
							<Spinner label="در حال دریافت اطلاعات..." size="sm" />
						)}
					</CardContent>
				)}
			</Card>
		</div>
	);
});
