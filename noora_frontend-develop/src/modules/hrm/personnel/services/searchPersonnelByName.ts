import { User } from "@/identity/users/models/User";
import { UserType } from "@/identity/users/models/UserType";
import { getUsers } from "@/identity/users/services/getUsers";
import searchUserFullname from "@/identity/users/utils/searchUserFullname";

interface PersonnelSearchByNameModel {
  name: string;
}

export async function searchPersonnelByName({
  name,
}: PersonnelSearchByNameModel): Promise<User[]> {
  const users = await getUsers({
    filters: {
      type: UserType.Personnel,
      ...searchUserFullname(name),
    },
  });

  return users;
}
