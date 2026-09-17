import { Instance } from "@/felo/instances/models/Instance";

import { ApplicationTask } from "./ApplicationTask";

interface Application {
	instance: Instance;
	tasks: ApplicationTask[];
}

export type { Application };
