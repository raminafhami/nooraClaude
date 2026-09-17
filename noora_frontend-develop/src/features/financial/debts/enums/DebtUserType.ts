import { ObjectType } from "@/utils/object/ObjectType";

enum DebtUserType {
  Coordinator = "coordinator",
  Customer = "customer",
}

const debtUserType: ObjectType<DebtUserType, { title: string }> = {
  [DebtUserType.Coordinator]: { title: "هماهنگ کننده" },
  [DebtUserType.Customer]: { title: "مشتری" },
};

export { DebtUserType, debtUserType };
