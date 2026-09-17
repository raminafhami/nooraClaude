"use client";

import { Dispatch, SetStateAction, useState } from "react";

type UseToggleReturn = [boolean, Dispatch<SetStateAction<boolean>>];

function useToggle(initialState?: boolean): UseToggleReturn {
  return useState<boolean>(initialState ?? false);
}

export { useToggle };
