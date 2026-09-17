import { User } from "@/identity/users/models/User";

type ContractApprover = {
  key: string;
  title: string;
  userId: string;
  isProxy: boolean;
  user?: User;
};

export type { ContractApprover };
