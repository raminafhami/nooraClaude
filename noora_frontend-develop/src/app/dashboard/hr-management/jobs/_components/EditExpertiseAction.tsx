"use client";

import { useState } from "react";
import { FaPencil } from "react-icons/fa6";
import { toast } from "sonner";

import { Expertise } from "@/hrm/expertises/models/Expertise";

import { ExpertiseUpsertDialog } from "../../expertises/_module/ExpertiseUpsertDialog";

// Pencil next to a job requirement. It edits the expertise itself with the
// same dialog as the توانمندی‌ها tab, so every job and personnel checklist
// that uses it shows the new title.
function EditExpertiseAction({
	expertise,
	onEdited,
}: {
	expertise: Expertise;
	onEdited: (updated: Expertise) => void;
}) {
	const [open, setOpen] = useState(false);

	// Typed into this form and not saved yet: it is not in توانمندی‌ها.
	if (!expertise.id) return null;

	return (
		<>
			<FaPencil
				className="h-4 w-4 cursor-pointer rounded bg-gray-200 p-0.5 transition-colors hover:bg-yellow-100 hover:text-yellow-700"
				title="ویرایش توانمندی"
				onClick={() => setOpen(true)}
			/>
			<ExpertiseUpsertDialog
				payload={expertise}
				open={open}
				onClose={(result) => {
					setOpen(false);
					if (result) {
						onEdited(result);
						toast.success("عنوان مورد نظر در صفحه توانمندی ها اصلاح گردید.");
					}
				}}
			/>
		</>
	);
}

export { EditExpertiseAction };
