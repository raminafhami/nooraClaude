import { getGroupByName } from "@/identity/groups/services/getGroupByName";
import { GenericObject } from "@/ts/GenericObject";

import { User } from "../models/User";
import { getUsers } from "./getUsers";

export default async function getUsersByGroupName<
  TMetadata extends GenericObject = any
>(name: string): Promise<User<TMetadata>[]> {
  const group = await getGroupByName(null, name);

  if (!group) {
    throw new Error("group is not found.");
  }

  return await getUsers({
    filters: {
      groups: group.id,
    },
  });
}
