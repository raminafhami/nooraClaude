import parseGoodsInspectionFieldOptions from "../utils/parseGoodsInspectionFieldOptions";
import getGoodsInspectionFields from "./getGoodsInspectionFields";

function getGoodsInspectionFieldOptions() {
  return parseGoodsInspectionFieldOptions(getGoodsInspectionFields());
}

export default getGoodsInspectionFieldOptions;
