import { z } from "zod";

import { ids } from "../../models/Ids";

export const schema = z.object({
  [ids.billOfLadingNo]: z.string(),
  [ids.billOfLadingDate]: z.string(),
  [ids.brand]: z.string(),
  [ids.certificateConclusion]: z.string(),
  [ids.certificateFormByAdminNote]: z.string(),
  [ids.consignee]: z.string(),
  [ids.exporter]: z.string(),
  [ids.grossWeight]: z.string(),
  [ids.importer]: z.string(),
  [ids.inspectorName]: z.string(),
  [ids.insuredBy]: z.string(),
  [ids.labName]: z.string(),
  [ids.lcNo]: z.string(),
  [ids.manufacturer]: z.string(),
  [ids.netWeight]: z.string(),
  [ids.packing]: z.string(),
  [ids.portOfEntry]: z.string(),
  [ids.proformaNo]: z.string(),
  [ids.proformaDate]: z.string(),
  [ids.quantityShipped]: z.string(),
  [ids.quantityTested]: z.string(),
  [ids.seller]: z.string(),
  [ids.shipper]: z.string(),
  [ids.testingPlace]: z.string(),
});
