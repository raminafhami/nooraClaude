import { Identity } from "@/auth/models/Identity";
import { UserType } from "@/identity/users/models/UserType";

function hasSystemPermission(identity: Identity | undefined): boolean {
  if (!identity || identity.type !== UserType.System) {
    return false;
  }

  return true;
}

export default hasSystemPermission;
