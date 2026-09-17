import { SelectItem } from "@/entities";

export const confidentialityOptions: SelectItem<string>[] = [
  { value: "normal", label: "عادی" },
  { value: "confidential", label: "محرمانه" },
];
export const fileOption: SelectItem<string>[] = [
  { value: "true", label: "دارد" },
  { value: "false", label: "ندارد" },
];
