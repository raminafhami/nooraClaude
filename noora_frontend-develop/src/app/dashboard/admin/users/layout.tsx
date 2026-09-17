"use client";

import { useRouter } from "next/navigation";
import { PropsWithChildren, useEffect } from "react";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";

function UsersLayout({ children }: PropsWithChildren) {
  const router = useRouter();
  const { isAuthorized } = useLoggedInUser();

  useEffect(() => {
    if (!isAuthorized({ groups: ["ceo"] })) {
      router.push("/dashboard");
    }
  }, [isAuthorized, router]);

  return <>{children}</>;
}

export default UsersLayout;
