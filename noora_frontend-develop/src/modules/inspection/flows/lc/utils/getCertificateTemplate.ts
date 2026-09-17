import { Instance } from "@/felo/instances/models/Instance";

import {
	LC_CERTIFICATE_TEMPLATE_V1,
	LC_CERTIFICATE_TEMPLATE_V2,
} from "../consts";

function getCertificateTemplate(instance: Pick<Instance, "version">) {
	return instance.version <= 5
		? LC_CERTIFICATE_TEMPLATE_V1
		: LC_CERTIFICATE_TEMPLATE_V2;
}

export { getCertificateTemplate };
