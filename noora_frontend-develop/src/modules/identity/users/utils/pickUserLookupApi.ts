import { createPicker } from "@/utils/pick";

import { UserApi } from "../models/User";

const pickUserLookupApi = createPicker<UserApi>()(["id", "name", "lastname"]);

export { pickUserLookupApi };
