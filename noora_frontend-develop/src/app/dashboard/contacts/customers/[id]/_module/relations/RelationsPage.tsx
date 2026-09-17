"use client";

import { useCallback, useEffect, useState } from "react";

import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import getUserById from "@/identity/users/services/getUserById";
import { getUsers } from "@/identity/users/services/getUsers";
import { CustomerRelation } from "@/inspection/customers/interfaces/CustomerRelation";

import { useCustomerContext } from "../CustomerContext";
import { RelationsForm } from "./RelationsForm";
import { RelationsTable } from "./RelationsTable";

function RelationsPage() {
	const { customer } = useCustomerContext();

	const [error, setError] = useState<string | null>(null);
	const [isLoading, setLoading] = useState<boolean>(true);
	const [relations, setRelations] = useState<CustomerRelation[]>([]);

	const loadRelations = useCallback(async () => {
		try {
			setLoading(true);

			const user = await getUserById(customer.id);
			const relations: CustomerRelation[] = user.metadata?.relations ?? [];

			const relationsUserIds = [
				...new Set(relations.flatMap((x) => [x.coordinator, x.marketer])),
			];

			const relationsUsers = relationsUserIds.length
				? await getUsers({
						filters: { _id: relationsUserIds },
					})
				: [];

			relations.forEach((x) => {
				if (x.coordinator) {
					const relationUser = relationsUsers.find(
						(y) => y.id === x.coordinator,
					);
					x.coordinator = relationUser
						? { id: relationUser.id, name: relationUser.fullname }
						: null;
				}

				if (x.marketer) {
					const relationUser = relationsUsers.find((y) => y.id === x.marketer);
					x.marketer = relationUser
						? { id: relationUser.id, name: relationUser.fullname }
						: null;
				}
			});

			setRelations(relations);
		} catch (err: any) {
			console.error(err);
			setError("خطای نامشخصی در هنگام دریافت اطلاعات رخ داد.");
		} finally {
			setLoading(false);
		}
	}, [customer.id]);

	useEffect(() => {
		loadRelations();
	}, [loadRelations]);

	const [selected, setSelected] = useState<CustomerRelation | null>(null);

	const handleRelationEdit = useCallback(
		(index: number) => {
			setSelected(relations[index]);
		},
		[relations],
	);

	const handleRelationEditCancel = useCallback(() => {
		setSelected(null);
	}, []);

	const handleRelationUpdate = useCallback(async () => {
		await loadRelations();
	}, [loadRelations]);

	return (
		<div className="grid grid-cols-1 gap-12 lg:grid-cols-3 xl:grid-cols-7">
			{!isLoading && error ? (
				<DestructiveAlert className="col-span-full w-fit max-w-full">
					<AlertDescription>{error}</AlertDescription>
				</DestructiveAlert>
			) : (
				<>
					<RelationsForm
						userId={customer.id}
						relation={selected}
						onEditCancel={handleRelationEditCancel}
						onUpdate={handleRelationUpdate}
					/>
					<RelationsTable
						loading={isLoading}
						relations={relations}
						onEdit={handleRelationEdit}
					/>
				</>
			)}
		</div>
	);
}

export { RelationsPage };
