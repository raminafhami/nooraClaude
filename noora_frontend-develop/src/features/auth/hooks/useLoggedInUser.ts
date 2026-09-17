"use client";

import { useContext, useMemo } from "react";

import { AuthContext, AuthContextType } from "../context/AuthContext";
import { Identity } from "../models/Identity";

function useLoggedInUser(): UseLoggedInUserReturn {
  const { identity, isAuthorized } = useContext(AuthContext);

  const ctx = useMemo<UseLoggedInUserReturn>(
    () => ({
      identity: identity!,
      isAuthorized,
    }),
    [identity, isAuthorized],
  );

  return ctx;
}

type UseLoggedInUserReturn = {
  identity: Identity;
} & Pick<AuthContextType, "isAuthorized">;

export { useLoggedInUser };
