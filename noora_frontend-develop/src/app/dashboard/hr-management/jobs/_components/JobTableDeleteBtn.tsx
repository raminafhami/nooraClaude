import { useState } from "react";
import { FaTrash } from "react-icons/fa6";

import { JobService } from "@/hrm/jobs/JobService";
import { Loading } from "@/ui/Loader";
import { Table } from "@/ui/Table";

interface Props {
  jobId: string;
  onDelete: () => void;
}

export default function JobTableDeleteBtn({ jobId, onDelete }: Props) {
  const [isProcessing, setProcessing] = useState<boolean>(false);

  async function handleClick() {
    if (isProcessing) {
      return;
    }

    try {
      setProcessing(true);

      const result = await JobService.delete(jobId);

      if (result) {
        onDelete();
      }
    } catch (err: any) {
    } finally {
      setProcessing(false);
    }
  }

  return (
    <Table.Action
      aria-disabled={isProcessing}
      className="hover:text-red-500 aria-disabled:cursor-default"
      onClick={handleClick}
    >
      {!isProcessing ? (
        <FaTrash />
      ) : (
        <Loading horizontalPlacement="center" size="xs" />
      )}
    </Table.Action>
  );
}
