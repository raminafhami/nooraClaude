import { z } from "zod";

import { ids } from "../../models/Ids";

export const schema = z.object({
  [ids.inspectionWagePayer]: z.string(),
  [ids.quantityOfGoodsControlType]: z.string(),
  [ids.quantityOfGoodsPercentControl]: z.string().optional(),
  [ids.quantityOfGoodsDocumentsControl]: z.boolean(),
  [ids.qualityOfGoodsControlType]: z.string(),
  [ids.qualityOfGoodsPercentControl]: z.string().optional(),
  [ids.qualityOfGoodsDocumentsControl]: z.boolean(),
  [ids.packingOfGoodsControlType]: z.string(),
  [ids.packingOfGoodsPercentControl]: z.string().optional(),
  [ids.packingOfGoodsDocumentsControl]: z.boolean(),
  [ids.monitoringOfLoadingProcess]: z.boolean(),
  [ids.issueInspectionCertificate]: z.boolean(),
  [ids.issueInspectionReport]: z.boolean(),
  [ids.contractAttachmentDescription]: z.string(),
  [ids.contractCustomerDescription]: z.string(),
});
