import { FaPencilAlt } from "react-icons/fa";

import { DynamicLink } from "@/components/ui/dynamic-link";
import { Table } from "@/ui/Table";

interface Props {
  jobId: string;
}

export default function JobTableEditBtn({ jobId }: Props) {
  return (
    <Table.Action className="hover:text-yellow-500">
      <DynamicLink
        className="flex w-full h-full items-center justify-center"
        href={`/dashboard/hr-management/jobs/${jobId}/edit`}
      >
        <FaPencilAlt />
      </DynamicLink>
    </Table.Action>
  );
}
