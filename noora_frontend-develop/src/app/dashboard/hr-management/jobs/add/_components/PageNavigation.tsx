import { FaAngleRight } from "react-icons/fa";

import { DynamicLink } from "@/components/ui/dynamic-link";

export function PageNavigation() {
  return (
    <>
      <div className="flex ms-6 grow">
        <DynamicLink
          className="flex px-3 py-1 border border-gray-200 rounded-lg text-black bg-white items-center transition hover:bg-gray-100 focus:bg-gray-100"
          href={`/dashboard/hr-management`}
        >
          <FaAngleRight className="text-2xs" />
          <span className="ms-1">بازگشت</span>
        </DynamicLink>
      </div>
    </>
  );
}
