import { type SelectItem } from "@/entities";

export const sendTypes: SelectItem<string>[] = [
  { value: "email", label: "ارسال از طریق پست الکترونیکی" },
  { value: "physical", label: "ارسال توسط پیک" },
];
