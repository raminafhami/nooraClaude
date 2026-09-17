import { IndustryType } from "../enums/IndustryType";

type IndustryApi = {
  id: string;
  name: string;
  type: IndustryType;
  parentId: string | IndustryApi | null;
};

export type { IndustryApi };
