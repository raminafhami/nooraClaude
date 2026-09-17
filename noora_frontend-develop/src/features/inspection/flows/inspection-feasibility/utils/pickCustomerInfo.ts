import { UserApi } from "@/identity/users/models/User";
import { createPicker } from "@/utils/pick";

const pickCustomerInfo = createPicker<UserApi>()(["id", "name", "lastname"]);

export { pickCustomerInfo };
