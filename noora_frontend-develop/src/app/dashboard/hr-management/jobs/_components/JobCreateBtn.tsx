import { FaPlus } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { DynamicLink } from "@/components/ui/dynamic-link";

export default function JobCreateBtn() {
  return (
    <DynamicLink href={`/dashboard/hr-management/jobs/add`}>
      <Button>
        <FaPlus className="text-2xs" />
        <span className="ms-1">افزودن سمت شغلی جدید</span>
      </Button>
    </DynamicLink>
  );
}
