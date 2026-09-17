import { z } from "zod";

import { PreviousTask } from "@/inspection/models/PreviousTask";

import { Goods } from "../../models/Goods";
import { ids } from "../../models/Ids";

export const schema = z.object({
  [ids.previousTask]: z.custom<PreviousTask>(),
  [ids.billOfLadingNo]: z.string(),
  [ids.billOfLadingDate]: z.string(),
  [ids.brand]: z.string(),
  [ids.certificateConclusion]: z.string(),
  [ids.certificateIssueDate]: z.string(),
  [ids.consignee]: z.string(),
  [ids.countryOfOrigin]: z.string(),
  [ids.exporter]: z.string(),
  [ids.goods]: z.custom<Goods>(),
  [ids.goodsSerialNos]: z.string(),
  [ids.grossWeight]: z.string(),
  [ids.importer]: z.string(),
  [ids.informationFinalReviewStatus]: z.string(),
  [ids.informationFinalReviewNote]: z.string(),
  [ids.inspectionDateEnd]: z.string(),
  [ids.inspectionDateStart]: z.string(),
  [ids.inspectionPlace]: z.string(),
  [ids.inspectorName]: z.string(),
  [ids.insuredBy]: z.string(),
  [ids.labName]: z.string(),
  [ids.lcNo]: z.string(),
  [ids.loadingDate]: z.string(),
  [ids.manufacturer]: z.string(),
  [ids.netWeight]: z.string(),
  [ids.packing]: z.string(),
  [ids.portOfEntry]: z.string(),
  [ids.proformaNo]: z.string(),
  [ids.proformaDate]: z.string(),
  [ids.quantityShipped]: z.string(),
  [ids.quantityTested]: z.string(),
  [ids.samplingDate]: z.string(),
  [ids.seller]: z.string(),
  [ids.shipper]: z.string(),
  [ids.testDateEnd]: z.string(),
  [ids.testDateStart]: z.string(),
  [ids.testingPlace]: z.string(),
  [ids.testIssuanceDate]: z.string(),
});
