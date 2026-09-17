import apiClient from "@/api/client";

import {
  UserUpdateApiModel,
  UserUpdateApiReturn,
  UserUpdateModel,
  UserUpdateReturn,
} from "../interfaces";
import { User, UserApi } from "../models/User";
import parseUser from "../utils/parseUser";

export class UserService {
  static async getById(id: string): Promise<User> {
    const response = await apiClient.get<UserApi>({
      url: `/users/${id}`,
    });

    return parseUser(response.result);
  }

  static async update(
    id: string,
    details: Partial<UserUpdateModel>,
  ): Promise<UserUpdateReturn> {
    const user = await this.getById(id);

    const data: Partial<UserUpdateApiModel> = {};

    const keys = Object.keys(details);

    keys.includes("username") && (data.username = details.username);
    keys.includes("firstname") && (data.name = details.firstname);
    keys.includes("lastname") && (data.lastname = details.lastname);
    keys.includes("nationalCode") && (data.nationalCode = details.nationalCode);
    keys.includes("phoneNo") && (data.phoneNo = details.phoneNo);
    keys.includes("email") && (data.email = details.email);
    keys.includes("password") && (data.password = details.password);
    keys.includes("groups") && (data.groups = details.groups);
    keys.includes("bankAccountNumber") &&
      (data.bankAccountNumber = details.bankAccountNumber);
    keys.includes("bankCardNumber") &&
      (data.bankCardNumber = details.bankCardNumber);
    keys.includes("bankSheba") && (data.bankSheba = details.bankSheba);
    keys.includes("bankAccountOwner") &&
      (data.bankAccountOwner = details.bankAccountOwner);
    keys.includes("sepidarId") && (data.sepidarId = details.sepidarId);

    let metadata: any = {};
    if (user.metadata) {
      metadata = { ...user.metadata };
    }

    keys.includes("metadata") &&
      (data.metadata = { ...metadata, ...details.metadata });

    const response = await apiClient.put<UserUpdateApiReturn>({
      url: `/users/${id}`,
      body: {
        id,
        ...data,
      },
    });

    const result: UserUpdateReturn = {
      id: response.result.id,
      username: response.result.username,
      firstname: response.result.name,
      lastname: response.result.lastname,
      nationalCode: response.result.nationalCode,
      phoneNo: response.result.phoneNo,
      email: response.result.email,
      groups: response.result.groups,
      metadata: response.result.metadata,
      bankAccountNumber: response.result.bankAccountNumber,
      bankAccountOwner: response.result.bankAccountOwner,
      bankCardNumber: response.result.bankCardNumber,
      bankSheba: response.result.bankSheba,
    };

    return result;
  }
}
