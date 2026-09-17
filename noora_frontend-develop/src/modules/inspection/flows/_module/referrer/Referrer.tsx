import { memo } from "react";

import ReferrerName from "./ReferrerName";
import ReferrerNote from "./ReferrerNote";

function Referrer({
	assigneeKey,
	noteId,
	noteContent,
	noteType,
	title,
	name,
}: {
	assigneeKey: string;
	noteId?: string;
	noteContent?: string;
	noteType?: "info" | "danger";
	title?: string;
	name?: string;
}) {
	return (
		<>
			<ReferrerName assigneeKey={assigneeKey} title={title} />
			{(noteId || noteContent) && (
				<ReferrerNote
					assigneeKey={assigneeKey}
					noteId={noteId}
					noteContent={noteContent}
					noteType={noteType}
				/>
			)}
		</>
	);
}

export default memo(Referrer);
