"use client"; // Error components must be Client Components

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FaPlugCircleExclamation } from "react-icons/fa6";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="w-full h-full flex flex-col  justify-center items-center text-base ">
      <div className="flex flex-col justify-center items-center space-y-4 bg-gray-100 rounded-2xl p-6">
        <FaPlugCircleExclamation
          className="mx-2 text-red-600 animate-bounce"
          size={40}
        />
        <div className="text-center flex flex-col space-y-1">
          <p>خطای نامشخصی رخ داده است!</p>
          <p>امکان دسترسی به این صفحه در این لحظه وجود ندارد.</p>
        </div>
        <div>
          <Button
            className="mt-2 mx-1"
            onClick={() => {
              reset();
            }}>
            تلاش مجدد
          </Button>
          {window.history?.length > 1 && (
            <Button
              className="mt-2 mx-1"
              onClick={() => {
                router.back();
              }}>
              بازگشت
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
