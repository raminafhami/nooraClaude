import { getUserDebts } from "./getUserDebts";

async function getUserRemainingCredit(userId: string): Promise<number> {
  const response = await getUserDebts(userId, {
    pagination: { page: 0, pageSize: 1 },
  });

  return response.remainingCredit;
}

export { getUserRemainingCredit };
