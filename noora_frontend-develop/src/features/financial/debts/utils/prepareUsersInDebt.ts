import { DebtUserType } from "../enums/DebtUserType";

type UserInDebt = {
  id: string;
  name: string;
  type: DebtUserType;
};

interface PrepareUsersInDebtDto {
  customer?: { id: string; name: string };
  coordinator?: { id: string; name: string };
}

function prepareUsersInDebtDto({
  customer,
  coordinator,
}: PrepareUsersInDebtDto): UserInDebt[] {
  const usersInDebt: UserInDebt[] = [];

  if (customer) {
    usersInDebt.push({
      id: customer.id,
      name: customer.name,
      type: DebtUserType.Customer,
    });
  }

  if (coordinator) {
    usersInDebt.push({
      id: coordinator.id,
      name: coordinator.name,
      type: DebtUserType.Coordinator,
    });
  }

  return usersInDebt;
}

export { type UserInDebt, prepareUsersInDebtDto };
