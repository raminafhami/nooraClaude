export interface UserUpdateModel {
  username: string | null;
  firstname: string;
  lastname: string;
  nationalCode: string | null;
  phoneNo: string | null;
  email: string | null;
  password: string;
  groups: string[];
  metadata?: any;
  bankAccountNumber?: string;
  bankCardNumber?: string;
  bankSheba?: string;
  bankAccountOwner?: string;
  sepidarId?: string;
}

export interface UserUpdateReturn extends Omit<UserUpdateModel, "password"> {
  id: string;
}

export interface UserUpdateApiModel {
  username: string | null;
  name: string;
  lastname: string;
  nationalCode: string | null;
  phoneNo: string | null;
  email: string | null;
  password: string;
  groups: string[];
  metadata?: any;
  bankAccountNumber?: string;
  bankCardNumber?: string;
  bankSheba?: string;
  bankAccountOwner?: string;
  sepidarId?: string;
}

export interface UserUpdateApiReturn
  extends Omit<UserUpdateApiModel, "password"> {
  id: string;
}
