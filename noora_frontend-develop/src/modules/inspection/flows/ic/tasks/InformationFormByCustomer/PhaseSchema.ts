import { z } from "zod";

import { ids } from "../../models/Ids";

export const schema = z.object({
  [ids.caseType]: z.string().optional(),
  [ids.registrationOrderNo]: z.string().optional(),
  [ids.registrationOrderDate]: z.string().optional(),
  [ids.proformaNo]: z.string().optional(),
  [ids.proformaDate]: z.string().optional(),
  [ids.bankName]: z.string().optional(),
  [ids.bankBranch]: z.string().optional(),
  // [ids.descriptionOfGoods]: z.string().optional(),
  [ids.customName]: z.string().optional(),
  // [ids.customTariffNo]: z.string().optional(),
  [ids.dischargerName]: z.string().optional(),
  [ids.dischargerPhoneNo]: z.string().optional(),
  [ids.informationFormByCustomerNote]: z.string().optional(),
});
