import apiClient from "@/api/client";

import { PersonnelScheduleAPIReturnModel } from "../models/personnelScheduleAPIReturnModel";
import { PersonnelScheduleCreateModel } from "../models/personnelScheduleCreateModel";

interface PersonnelScheduleCreateApiModel
  extends PersonnelScheduleCreateModel {}

interface PersonnelScheduleCreateReturn
  extends PersonnelScheduleAPIReturnModel {}

interface PersonnelScheduleCreateApiReturn
  extends PersonnelScheduleAPIReturnModel {}

export async function createPersonnelSchedule(
  details: PersonnelScheduleCreateModel,
): Promise<PersonnelScheduleCreateReturn> {
  const data: PersonnelScheduleCreateApiModel = { ...details };
  const response = await apiClient.post<PersonnelScheduleCreateApiReturn>({
    url: "/personnel-attendance/create-personnel-schedule",
    body: data,
  });

  return response.result;
}
