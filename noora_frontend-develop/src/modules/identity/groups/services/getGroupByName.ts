import { UserGroup } from "../models/Group";
import { UserGroupType } from "../models/GroupType";
import { getGroups } from "./getGroups";

export async function getGroupByName(
  type: UserGroupType | null,
  name: string
): Promise<UserGroup | null> {
  const groups = await getGroups(type, {
    filters: [{ name: "name", value: name }],
  });

  if (groups.length === 0) {
    return null;
  }

  return groups[0];
}
