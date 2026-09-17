import { z } from "zod";

import { Goods } from "../../models/Goods";
import { ids } from "../../models/Ids";

export const schema = z.object({
  [ids.billOfLadingDate]: z.string(),
  [ids.billOfLadingNo]: z.string(),
  [ids.certificateConclusion]: z.string(),
  [ids.certificateFormNote]: z.string(),
  [ids.certificateIssueDate]: z.string().nullable(),
  [ids.certificateIssueNo]: z.string().nullable(),
  [ids.consignee]: z.string(),
  [ids.exporter]: z.string(),
  [ids.goods]: z.custom<Goods>(),
  [ids.goodsCustomTariffNos]: z.string(),
  [ids.goodsDescriptions]: z.string(),
  [ids.grossWeight]: z.string(),
  [ids.importer]: z.string(),
  [ids.inspectionDateEnd]: z.string(),
  [ids.inspectionDateStart]: z.string(),
  [ids.portOfEntry]: z.string(),
  [ids.proformaNo]: z.string(),
  [ids.proformaDate]: z.string(),
  [ids.registrationOrderNo]: z.string(),
  [ids.samplingDate]: z.string(),
  [ids.shipper]: z.string(),
  [ids.testDateEnd]: z.string(),
  [ids.testDateStart]: z.string(),
});
