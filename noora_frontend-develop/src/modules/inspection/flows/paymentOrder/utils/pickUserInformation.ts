import { UserApi } from "@/identity/users/models/User";
import { createPicker } from "@/utils/pick";

const pickUserInformation = createPicker<UserApi>()(["id", "name", "lastname"]);

export { pickUserInformation };
