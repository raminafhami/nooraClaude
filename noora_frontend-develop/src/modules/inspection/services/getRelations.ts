import { User } from "@/identity/users/models/User";
import { getUsers } from "@/identity/users/services/getUsers";

async function getRelations(
  customerId?: string,
  branchManagerId?: string,
): Promise<GetRelationsReturn> {
  try {
    if (!customerId) {
      throw Error("مشتری مشخص نشده است.");
    }

    const userIds: string[] = [customerId];
    branchManagerId && userIds.push(branchManagerId);

    const users = await getUsers({
      filters: { _id: Array.from(new Set(userIds)) },
    });

    const customer = users.find((x) => x.id === customerId);
    const branchManager = branchManagerId
      ? users.find((x) => x.id === branchManagerId)
      : null;

    if (!customer || (branchManagerId && !branchManager)) {
      throw new Error("کاربر مورد نظر یافت نشد.");
    }

    const coordinatorId =
      customer.metadata.relations?.find((x: any) => x.status === "active")
        ?.coordinator ||
      branchManager?.metadata.relations?.find((x: any) => x.status === "active")
        ?.coordinator ||
      null;

    // if (!coordinatorId) {
    //   throw new Error("هماهنگ کننده مشخص نشده است.");
    // }

    const marketerId =
      customer.metadata.relations?.find((x: any) => x.status === "active")
        ?.marketer ||
      branchManager?.metadata.relations?.find((x: any) => x.status === "active")
        ?.marketer ||
      null;

    // if (!marketerId) {
    //   throw new Error("بازاریاب مشخص نشده است.");
    // }

    const relationUsers = await getUsers({
      filters: { _id: Array.from(new Set([coordinatorId, marketerId])) },
    });

    const coordinator = coordinatorId
      ? relationUsers.find((x) => x.id === coordinatorId)
      : undefined;
    // if (!coordinator) {
    //   throw new Error("هماهنگ کننده یافت نشد.");
    // }

    const marketer = marketerId
      ? relationUsers.find((x) => x.id === marketerId)
      : undefined;
    // if (!marketer) {
    //   throw new Error("بازاریاب یافت نشد.");
    // }

    const result: GetRelationsReturn = {
      coordinator,
      marketer,
    };

    return result;
  } catch (err: any) {
    console.error(err);
    throw new Error(err?.message ?? "خطای نامشخصی رخ داد.");
  }
}

interface GetRelationsReturn {
  coordinator: User | undefined;
  marketer: User | undefined;
}

export type { GetRelationsReturn };
export default getRelations;
