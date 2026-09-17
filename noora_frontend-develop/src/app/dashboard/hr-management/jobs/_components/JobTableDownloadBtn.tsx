import { useState } from "react";
import { FaPrint } from "react-icons/fa6";

import downloadJobTemplate from "@/hrm/jobs/utils/downloadJobTemplate";
import { Loading } from "@/ui/Loader";
import { Table } from "@/ui/Table";

interface Props {
  jobId: string;
}

export default function JobTableDownloadBtn({ jobId }: Props) {
  const [isProcessing, setProcessing] = useState<boolean>(false);

  async function handleClick() {
    if (isProcessing) {
      return;
    }

    try {
      setProcessing(true);
      await downloadJobTemplate(jobId);
    } catch (err: any) {
    } finally {
      setProcessing(false);
    }
  }

  return (
    <Table.Action
      aria-disabled={isProcessing}
      className="hover:text-blue-500 aria-disabled:cursor-default"
      onClick={handleClick}
    >
      {!isProcessing ? (
        <FaPrint />
      ) : (
        <Loading horizontalPlacement="center" size="xs" />
      )}
    </Table.Action>
  );
}
