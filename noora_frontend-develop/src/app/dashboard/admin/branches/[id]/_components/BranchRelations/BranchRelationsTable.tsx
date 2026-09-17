"use client";

import moment from "jalali-moment";
import { memo, useCallback, useEffect, useState } from "react";
import { FaHourglass, FaPencil } from "react-icons/fa6";

import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
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
import getUserById from "@/identity/users/services/getUserById";
import { getUsers } from "@/identity/users/services/getUsers";
import { LiaisonRelation } from "@/liaison-relations/models/LiaisonRelation";
import {
	LiaisonRelationStatus,
	liaisonRelationStatus,
} from "@/liaison-relations/models/LiaisonRelationStatus";

import { useBranchContext } from "../BranchContext";

interface Props {
	relationInUpdate: number | null;
	onRelationEdit: (relation: LiaisonRelation, Index: number) => void;
}

export const BranchRelationsTable = memo(function BranchRelationsTable({
	relationInUpdate,
	onRelationEdit,
}: Props) {
	const { branch, relations, onRelationsUpdate } = useBranchContext();

	const [isLoading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	const loadRelations = useCallback(async (): Promise<void> => {
		try {
			setLoading(true);
			setError(null);

			const manager = await getUserById(branch.managerId!);

			if (!manager.metadata?.relations) {
				onRelationsUpdate([]);
			} else {
				const userIds = [
					...new Set(
						manager.metadata?.relations
							?.flatMap((x: LiaisonRelation) => [x.coordinator, x.marketer])
							.filter((x: string | null) => x),
					),
				];

				const users = await getUsers({
					filters: { _id: userIds },
				});

				const relations = manager.metadata?.relations.map(
					(x: LiaisonRelation<string>): LiaisonRelation => ({
						...x,
						coordinator: (() => {
							if (!x.coordinator) {
								return null;
							}

							const coordinator = users.find((y) => y.id === x.coordinator)!;
							return { id: coordinator.id, name: coordinator.fullname };
						})(),
						marketer: (() => {
							if (!x.marketer) {
								return null;
							}

							const marketer = users.find((y) => y.id === x.marketer);
							return marketer
								? { id: marketer.id, name: marketer.fullname }
								: null;
						})(),
					}),
				);

				onRelationsUpdate(relations);
			}
		} catch (err: any) {
			console.error(err);
			setError(err?.message || "خطایی در دریافت اطلاعات رخ داد.");
		} finally {
			setLoading(false);
		}
	}, [branch.managerId, onRelationsUpdate]);

	useEffect(() => {
		if (relations.length === 0) {
			loadRelations();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [loadRelations]);

	return (
		<div>
			<Card>
				<CardHeader>
					<CardTitle>لیست روابط</CardTitle>
				</CardHeader>

				{relations.length > 0 || (!isLoading && !error) ? (
					<CardContent className="px-0">
						<Table
							slotProps={{ root: { className: "rounded-none border-x-0" } }}
						>
							<TableHeader>
								<TableRow>
									<TableHead className="w-12"></TableHead>
									<TableHead className="w-12">ردیف</TableHead>
									<TableHead className="w-56">هماهنگ کننده</TableHead>
									<TableHead className="w-56">بازاریاب</TableHead>
									<TableHead className="w-36">از تاریخ</TableHead>
									<TableHead className="w-36">تا تاریخ</TableHead>
									<TableHead className="w-24">وضعیت</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{relations.length > 0 &&
									relations.map((relation, index) => {
										const isUpdating = relationInUpdate === index;

										return (
											<TableRow key={index}>
												<TableCell>
													{relation.status === LiaisonRelationStatus.Active && (
														<TableActions>
															{isUpdating ? (
																<TableAction
																	className="cursor-default"
																	title="Updating..."
																>
																	<FaHourglass />
																</TableAction>
															) : (
																<>
																	<TableAction
																		onClick={() =>
																			onRelationEdit(relation, index)
																		}
																	>
																		<FaPencil />
																	</TableAction>
																</>
															)}
														</TableActions>
													)}
												</TableCell>
												<TableCell>{index + 1}</TableCell>
												<TableCell>
													{relation.coordinator?.name || "-"}
												</TableCell>
												<TableCell>{relation.marketer?.name || "-"}</TableCell>
												<TableCell>
													{moment
														.from(relation.createAt as any, "en")
														.format("jYYYY/jMM/jDD")}
												</TableCell>
												<TableCell>
													{relation.deactiveAt
														? moment
																.from(relation.deactiveAt as any, "en")
																.format("jYYYY/jMM/jDD")
														: "-"}
												</TableCell>
												<TableCell>
													{liaisonRelationStatus[relation.status]}
												</TableCell>
											</TableRow>
										);
									})}
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
