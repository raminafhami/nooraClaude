import { z } from "zod";

import { ReviewStatus } from "@/inspection/models/ReviewStatus";

import { ids } from "../../models/Ids";

export const schema = z.object({
  [ids.tsInformationReviewByTechExpertNote]: z.string(),
  [ids.tsInformationReviewByTechExpertStatus]: z.custom<ReviewStatus>(),
});
