import goodsInspectionFields from "../data/goodsInspectionFields";
import { GoodsInspectionField } from "../models/GoodsInspectionField";

interface GetGoodsInspectionFieldsOptions {}

function getGoodsInspectionFields(
  options?: GetGoodsInspectionFieldsOptions
): GoodsInspectionField[] {
  let result = goodsInspectionFields.filter((x) => !x.isDeleted);

  return result;
}

export default getGoodsInspectionFields;
