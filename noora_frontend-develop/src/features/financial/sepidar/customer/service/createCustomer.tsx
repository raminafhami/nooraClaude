import apiClient from "@/api/client";

interface CreateCustomerModel {
  name: string;
  lastname?: string;
  nationalCode: string;
  address: string;
  contactNo: string;
  postalCode: string;
  isCustomer: boolean;
  code: string | null;
  type: string;
}

interface CreateCustomerApiModel {
  name: string;
  lastname: string;
  nationalCode: string;
  address: string;
  contactNo: string;
  postalCode: string;
  isCustomer: boolean;
  code: string | null;
  type: string;
}

export default async function createCustomer(
  details: CreateCustomerModel,
): Promise<string> {
  const data: CreateCustomerApiModel = {
    name: details.name,
    lastname: details.lastname ?? "",
    nationalCode: details.nationalCode,
    address: details.address,
    contactNo: details.contactNo,
    postalCode: details.postalCode,
    isCustomer: details.isCustomer,
    code: details.code,
    type: details.type,
  };

  const response = await apiClient.post<string>({
    url: "/financial/customer",
    body: data,
  });

  return response.result;
}
