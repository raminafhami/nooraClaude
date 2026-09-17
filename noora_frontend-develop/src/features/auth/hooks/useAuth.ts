"use client";

import { useContext } from "react";

import { AuthContext, AuthContextType } from "../context/AuthContext";

function useAuth(): AuthContextType {
  return useContext(AuthContext);
}

export { useAuth };
