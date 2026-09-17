import { ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const extendedTwMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["xsm"] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return extendedTwMerge(clsx(inputs));
}
