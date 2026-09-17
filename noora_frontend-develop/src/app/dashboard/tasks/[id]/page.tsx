import { Metadata } from "next";

import TaskClient from "./_module/TaskClient";

const revalidate = 0;

const metadata: Metadata = {
	title: "Task Details",
};

interface Props {
	params: {
		id: string;
	};
	searchParams: { t: string };
}

async function TaskPage({ params: { id }, searchParams: { t } }: Props) {
	return <TaskClient key={t} id={id} />;
}

export { metadata, revalidate };
export default TaskPage;
