import { LiaisonRelationStatus } from "./LiaisonRelationStatus";
import { LiaisonRelationUser } from "./LiaisonRelationUser";

export interface LiaisonRelation<
  TUser extends string | LiaisonRelationUser = LiaisonRelationUser
> {
  coordinator: TUser | null;
  marketer: TUser | null;
  createAt: Date;
  deactiveAt: Date | null;
  status: LiaisonRelationStatus;
}
