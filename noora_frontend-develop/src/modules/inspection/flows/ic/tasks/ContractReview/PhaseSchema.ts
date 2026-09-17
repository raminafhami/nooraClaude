import { z } from "zod";

import { ids } from "../../models/Ids";

export const schema = z.object({
  [ids.contractDescription]: z.string(),
});
