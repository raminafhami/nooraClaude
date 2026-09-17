import { Metadata } from "next";

import WorkspaceClientPage from "./_module/WorkspacePage";

const metadata: Metadata = {
	title: "My Workspace",
};

function WorkspacePage() {
	return <WorkspaceClientPage />;
}

export { metadata };
export default WorkspacePage;
