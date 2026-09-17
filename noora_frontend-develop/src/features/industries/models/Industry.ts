import { IndustryType } from "../enums/IndustryType";

type Industry = {
  id: string;
  name: string;
  type: IndustryType;
  parentId: string | null;
  parent?: Industry | null;
};

export type { Industry };
