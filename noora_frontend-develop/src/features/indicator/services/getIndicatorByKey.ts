import { Indicator } from "../models/Indicator";
import { getIndicators } from "./getIndicators";

async function getIndicatorByKey(key: string): Promise<Indicator | null> {
  const indicators = await getIndicators({
    filters: { key },
  });

  return indicators.at(0) ?? null;
}

export { getIndicatorByKey };
