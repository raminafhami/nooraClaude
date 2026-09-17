import { type SelectItem } from "@/entities";

export const contractSubmissionMethods: SelectItem<string>[] = [
  {
    value: "system",
    label: "سیستمی",
  },
  {
    value: "manual",
    label: "دستی",
  },
];
