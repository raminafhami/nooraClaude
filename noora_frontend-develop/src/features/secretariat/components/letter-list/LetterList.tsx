"use client";

import { useCallback, useMemo, useState } from "react";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { usePagination } from "@/components/ui/pagination/usePagination";
import { Instance } from "@/felo/instances/models/Instance";
import { InstanceQueryFilter } from "@/felo/instances/models/InstanceQuery";
import { getInstances } from "@/felo/instances/services/getInstances";
import { UserLookup } from "@/identity/users/models/UserLookup";
import { LetterProvider } from "@/secretariat/providers/LetterProvider";

import { LetterSearch } from "./LetterSearch";
import { LetterTable } from "./LetterTable";

const PROCESS_DEFINITION_KEYS = [
	"SecretariatOutgoingLetter",
	"Secretariat_Letter_Outgoing",
];

function LetterList({ inspectionCaseNo }: { inspectionCaseNo?: string }) {
	const { identity, isAuthorized } = useLoggedInUser();

	const canSeeAll = useMemo<boolean>(
		() => isAuthorized({ groups: ["ceo", "secretary"] }),
		[isAuthorized],
	);

	const [queryFilters, setQueryFilters] = useState<
		Partial<{
			caseNo: string;
			author: UserLookup;
			subject: string;
		}>
	>({});

	const fetchLetters = useCallback(
		async (page: number, pageSize: number) => {
			const filters: InstanceQueryFilter[] = [
				{
					name: "processDefinitionKey",
					value: { $in: PROCESS_DEFINITION_KEYS },
				},
			];

			if (!canSeeAll) {
				filters.push({
					name: "$or",
					value: [
						{ "parameters.Assignees.creator.id": identity.id },
						{
							$or: [
								{
									"parameters.LetterReviewStatus": "forward",
									"parameters.Assignees.reviewer.id": identity.id,
								},
								{
									"parameters.ReviewBy": { $elemMatch: { id: identity.id } },
								},
							],
						},
						{ "parameters.Assignees.Author.id": identity.id },
						{ "parameters.Assignees.Approver.id": identity.id },
					],
				});
			}

			if (inspectionCaseNo) {
				filters.push({
					name: "parameters.RelatedInspectionCaseNo",
					value: {
						$regex: inspectionCaseNo,
					},
				});
			}

			if (queryFilters.caseNo) {
				filters.push({
					name: "caseNo",
					value: queryFilters.caseNo,
				});
			}

			if (queryFilters.subject) {
				filters.push({
					name: "parameters.LetterSubject",
					value: {
						$regex: queryFilters.subject,
						$options: "i",
					},
				});
			}

			if (queryFilters.author?.id) {
				filters.push({
					name: "owner",
					value: queryFilters.author.id,
				});
			}

			const result = await getInstances({
				filters,
				page: {
					no: page,
					size: pageSize,
				},
				props: [
					"Assignees",
					"LetterSubject",
					"RelatedInspectionCaseNo",
					"LetterFollowingOfs",
					"LetterReviewByManagerStatus",
					"LetterReviewStatus",
				],
				sort: { createdAt: "desc" },
			});

			return [result.items, result.total] as const;
		},
		[
			inspectionCaseNo,
			identity,
			canSeeAll,
			queryFilters.author,
			queryFilters.caseNo,
			queryFilters.subject,
		],
	);

	const { items, isLoading, offset, Pagination } =
		usePagination<Instance>(fetchLetters);

	return (
		<>
			{!inspectionCaseNo && <LetterSearch setSearch={setQueryFilters} />}

			<LetterProvider>
				<LetterTable
					loading={isLoading}
					data={items}
					offset={offset}
					pagination={<Pagination />}
				/>
			</LetterProvider>
		</>
	);
}

export { LetterList };
