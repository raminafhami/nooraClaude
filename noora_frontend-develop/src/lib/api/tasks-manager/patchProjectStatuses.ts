import apiClient from "../client";

interface PatchProjectStatusesProps {
  name: string;
  order: number;
  _id: string;
}
interface Props {
  statuses: Array<PatchProjectStatusesProps>;
  projectId: string;
}
export default async function PatchProjectStatuses({
  projectId,
  statuses,
}: Props) {
  let response;
  let link = `project/statuses/${projectId}`;

  response = await apiClient.patch({
    url: link,
    body: {
      statuses,
    },
  });

  return response;
}
