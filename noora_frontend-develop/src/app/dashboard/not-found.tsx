import { FaRoadCircleXmark } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { DynamicLink } from "@/components/ui/dynamic-link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-grow items-center justify-center bg-gray-50">
      <div className="rounded-lg bg-white p-8 text-center shadow-xl">
        <h1 className="mb-4 text-4xl font-bold flex justify-center items-center">
          <FaRoadCircleXmark size={50} className="text-blue-600" />
        </h1>
        <p className="text-gray-600 mb-4">صفحه مورد نظر یافت نشد!</p>
        <DynamicLink href="/">
          <Button>بازگشت</Button>
        </DynamicLink>
      </div>
    </div>
  );
}
