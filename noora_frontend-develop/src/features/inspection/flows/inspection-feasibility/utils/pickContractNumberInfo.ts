import { ContractNumber } from "@/contract-number/models/ContractNumber";
import { createPicker } from "@/utils/pick";

const pickContractNumberInfo = createPicker<ContractNumber>()([
	"id",
	"cn",
	"title",
]);

export { pickContractNumberInfo };
