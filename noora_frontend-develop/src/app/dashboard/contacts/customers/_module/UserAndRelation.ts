import { User } from "@/identity/users/models/User";

type UserAndRelations = {
	user: User;
	coordinator?: User;
	marketer?: User;
};

export type { UserAndRelations };
