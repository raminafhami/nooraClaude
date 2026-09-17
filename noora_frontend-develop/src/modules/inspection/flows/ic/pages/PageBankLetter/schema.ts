import { z } from "zod";

export const bankLetterSchema = z.object({
  bankBranch: z.string().nonempty("شعبه بانک اجباری است"),
  bankName: z.string().nonempty("نام بانک اجباری است"),
  registrationOrderDate: z.string().nonempty("تاریخ ثبت سفارش اجباری است"),
});
