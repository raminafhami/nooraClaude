import apiClient from "../client";

interface getUserTasksDoneProps {
  page: number;
  size: number;
  processInstanceId: string;
}

export default async function GetUserTasksDone({
  page,
  size,
  processInstanceId,
}: getUserTasksDoneProps) {
  let response;
  let link = `/my-tasks/done${page ? `?page=${page}` : `?page=${0}`}&${
    size ? `size=${size}` : `size=${999}`
  }${
    processInstanceId
      ? `&filters={"processInstanceId":"${processInstanceId}"}`
      : ""
  }`;

  response = await apiClient.get({
    url: link,
  });

  return response;
}
