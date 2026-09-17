import { UserLookup } from "@/identity/users/models/UserLookup";

type CollectionQuery = Partial<{
	coordinator: UserLookup;
	marketer: UserLookup;
	customer: UserLookup;
	createdFromDate: Date;
	createdToDate: Date;
	completedFromDate: Date;
	completedToDate: Date;
	branch: { value: string; label: string }[] | undefined;
}>;

export type { CollectionQuery };
