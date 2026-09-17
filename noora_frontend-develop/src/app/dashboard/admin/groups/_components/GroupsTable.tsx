"use client";

import { useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useState } from "react";
import { FaEye, FaRotate } from "react-icons/fa6";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { Branch } from "@/branches/models/Branch";
import { getBranches } from "@/branches/services/getBranches";
import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardNav,
	CardTitle,
} from "@/components/ui/card";
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
import { Select } from "@/form/select";
import { UserGroup } from "@/identity/groups/models/Group";
import { getGroups } from "@/identity/groups/services/getGroups";
import { getDynamicUrl } from "@/utils/url/getDynamicUrl";

interface Props {
	groups: UserGroup[];
	onGroupsLoad: (groups: UserGroup[]) => void;
}

export const GroupsTable = memo(function GroupsTable({
	groups,
	onGroupsLoad,
}: Props) {
	const router = useRouter();

	const { identity } = useLoggedInUser();

	const [isLoading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
	const [branches, setBranches] = useState<Branch[]>([]);

	const handleGroupsLoad = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			const groups = await getGroups(null, {
				filters: [
					{
						name: "metadata.branchId",
						value:
							identity.branchId === null
								? selectedBranch?.id || null
								: identity.branchId,
					},
					{ name: "type", value: "group" },
				],
				sort: { title: "asc" },
			});
			onGroupsLoad(groups);
		} catch (err: any) {
			setError(err?.message || "Something went wrong.");
		} finally {
			setLoading(false);
		}
	}, [identity, selectedBranch, onGroupsLoad]);

	const handleGroupRedirect = useCallback(
		(id: string) => {
			router.push(getDynamicUrl(`/dashboard/admin/groups/${id}`));
		},
		[router],
	);

	useEffect(() => {
		handleGroupsLoad();
	}, [handleGroupsLoad]);

	useEffect(() => {
		(async () => {
			if (identity.branchId === null) {
				const branches = await getBranches({ sort: { title: "asc" } });
				setBranches(branches);
			}
		})();
	}, [identity.branchId]);

	return (
		<div>
			<Card>
				<CardHeader orientation="horizontal">
					<CardTitle>
						<span>لیست گروه ها</span>

						{(groups.length > 0 || error) && (
							<Button
								className="w-fit"
								disabled={isLoading}
								variant="link"
								onClick={handleGroupsLoad}
							>
								{isLoading ? <Spinner size="xs" /> : <FaRotate />}
							</Button>
						)}
					</CardTitle>

					<CardNav>
						<div className="flex w-56 items-center gap-x-2">
							<label htmlFor="branchFilter">شعبه:</label>
							<div className="grow">
								<Select<Branch>
									defaultText="مرکزی"
									id="branchFilter"
									items={branches.map((x) => ({ label: x.title, value: x }))}
									optional
									value={selectedBranch || undefined}
									onMutate={(v) => setSelectedBranch(v || null)}
								/>
							</div>
						</div>
					</CardNav>
				</CardHeader>

				{groups.length > 0 || (!isLoading && !error) ? (
					<CardContent className="px-0">
						<Table
							slotProps={{ root: { className: "rounded-none border-x-0" } }}
						>
							<TableHeader>
								<TableRow>
									<TableHead className="w-20"></TableHead>
									<TableHead className="w-14">ردیف</TableHead>
									<TableHead className="w-56">عنوان</TableHead>
									<TableHead className="w-56">کلیدواژه</TableHead>
									<TableHead></TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{groups.length > 0 &&
									groups.map((group: UserGroup, index: number) => (
										<TableRow key={group.id}>
											<TableCell>
												<TableActions>
													<TableAction
														title="View group"
														onClick={() => handleGroupRedirect(group.id)}
													>
														<FaEye />
													</TableAction>
												</TableActions>
											</TableCell>
											<TableCell className="text-center">{index + 1}</TableCell>
											<TableCell>
												<span
													className="cursor-pointer"
													onClick={() => handleGroupRedirect(group.id)}
												>
													{group.title}
												</span>
											</TableCell>
											<TableCell>{group.name}</TableCell>
											<TableCell></TableCell>
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
