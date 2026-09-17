import { UserGroupType } from "@/identity/groups/models/GroupType";
import { getGroupById } from "@/identity/groups/services/getGroupById";
import { getGroupByName } from "@/identity/groups/services/getGroupByName";
import { User } from "@/identity/users/models/User";
import { UserQueryFilter } from "@/identity/users/models/UserQuery";
import { getUsers } from "@/identity/users/services/getUsers";
import searchUserFullname from "@/identity/users/utils/searchUserFullname";

export async function getInspectors(
  branchId: string | null,
  name?: string
): Promise<User[]> {
  let inspectorsGroupId: string | null = null;
  let inspectorsGroupName: string = "";

  if (branchId) {
    const userBranch = await getGroupById(branchId);

    inspectorsGroupName = `${userBranch.name}-inspectors`;
    const inspectorsGroup = await getGroupByName(
      UserGroupType.Group,
      inspectorsGroupName
    );

    inspectorsGroupId = inspectorsGroup?.id || null;
  } else {
    inspectorsGroupName = "surveyors";
    const inspectorsGroup = await getGroupByName(
      UserGroupType.Group,
      "surveyors"
    );

    inspectorsGroupId = inspectorsGroup?.id || null;
  }

  if (!inspectorsGroupId) {
    console.error(`Inspectors group '${inspectorsGroupName}' was not found.`);
    // throw new Error(`Branch inspectors group '${inspectorsGroupName}' was not found.`)
  }

  let filters: Partial<UserQueryFilter> = {
    groups: inspectorsGroupId,
  };

  if (name) {
    filters = { filters, ...searchUserFullname(name) };
  }

  const inspectors = await getUsers({
    filters,
  });

  return inspectors;
}
