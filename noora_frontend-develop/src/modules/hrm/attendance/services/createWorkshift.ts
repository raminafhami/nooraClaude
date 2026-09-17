import apiClient from "@/api/client";
import { TimeString } from "@/time/TimeString";

import { Workshift } from "../models/Workshift";

interface WorkshiftCreateModel {
  entryTime: TimeString;
  exitTime: TimeString;
  flexible: TimeString;
  title: string;
  legalExtra: TimeString;
}

interface WorkshiftCreateApiModel extends WorkshiftCreateModel {}

interface WorkshiftCreateReturn extends Workshift {}

interface WorkshiftCreateApiReturn extends Workshift {}

export async function createWorkshift(
  details: WorkshiftCreateModel,
): Promise<WorkshiftCreateReturn> {
  const data: WorkshiftCreateApiModel = { ...details };

  const response = await apiClient.post<WorkshiftCreateApiReturn>({
    url: "/working-time-regulations",
    body: data,
  });

  return response.result;
}
