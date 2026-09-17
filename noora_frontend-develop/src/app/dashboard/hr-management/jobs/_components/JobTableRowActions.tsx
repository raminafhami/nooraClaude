import { Table } from "@/ui/Table";

import JobTableDeleteButton from "./JobTableDeleteBtn";
import JobTableDownloadBtn from "./JobTableDownloadBtn";
import JobTableEditBtn from "./JobTableEditBtn";

interface Props {
  jobId: string;
  canDelete: boolean;
  onDelete: () => void;
}

export default function JobTableRowActions({
  canDelete,
  jobId,
  onDelete,
}: Props) {
  return (
    <Table.Actions>
      <JobTableEditBtn jobId={jobId} />
      <JobTableDownloadBtn jobId={jobId} />
      {canDelete && <JobTableDeleteButton jobId={jobId} onDelete={onDelete} />}
    </Table.Actions>
  );
}
