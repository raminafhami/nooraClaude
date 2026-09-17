import { ProcessApi } from "@/felo/processes/models";
import { createPicker } from "@/utils/pick";

const pickProcessDefinitionInfo = createPicker<ProcessApi>()(["key", "name"]);

export { pickProcessDefinitionInfo };
