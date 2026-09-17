import { z } from "zod";

import { ids } from "../../models/Ids";
import { ReviewStatus } from "./ReviewStatus";

export const schema = z.object({
  [ids.certificateDraftPreviewStatus]: z.custom<ReviewStatus>(),
});
