import apiClient from "../client";

interface GetUserStakeholderProps {
  page: number;
  size: number;
  filterByUser?: string;
}

export default async function GetUserStakeholder({
  page,
  size,
  filterByUser,
}: GetUserStakeholderProps) {
  let response;
  const filter: any = { parameters: { InvoicePaymentStatus: "paid" } };
  filterByUser &&
    (filter.parameters.Costs = {
      $elemMatch: { personId: filterByUser },
      payment: null,
    });

  let link = `process-instances?page=${page}&size=${size}&filters={"parameters.InvoicePaymentStatus":"paid"${
    filterByUser
      ? `,"parameters.Costs":{"$elemMatch":{"personId":"${filterByUser}","payment":null}}`
      : ""
  }}&props=Costs,InvoicePaymentStatus,Buyer,InspectionFee`;

  response = await apiClient.get({
    url: link,
  });

  return response;
}
