"use client";

import { useEffect, useState } from "react";
import { FaPencil } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { messages } from "@/messages";

// Pencil next to a duty / authority of a job description: edits that line in
// place (the form is saved with the job as before).
function EditTextItemAction({
	value,
	title,
	onEdited,
}: {
	value: string;
	title: string;
	onEdited: (value: string) => void;
}) {
	const [open, setOpen] = useState(false);
	const [text, setText] = useState(value);

	useEffect(() => {
		if (open) setText(value);
	}, [open, value]);

	const trimmed = text.trim();

	return (
		<>
			<FaPencil
				className="h-4 w-4 cursor-pointer rounded bg-gray-200 p-0.5 transition-colors hover:bg-yellow-100 hover:text-yellow-700"
				title={title}
				onClick={() => setOpen(true)}
			/>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="max-w-screen-sm">
					<DialogHeader>
						<DialogTitle>{title}</DialogTitle>
					</DialogHeader>

					<form
						className="space-y-8"
						onSubmit={(event) => {
							event.preventDefault();
							event.stopPropagation();
							if (!trimmed) return;
							onEdited(trimmed);
							setOpen(false);
						}}
					>
						<div className="space-y-2">
							<Textarea
								autoFocus
								rows={4}
								value={text}
								onChange={(e) => setText(e.target.value)}
							/>
							{!trimmed && (
								<div className="text-sm text-red-600">
									{messages.validation.required}
								</div>
							)}
						</div>

						<div className="flex flex-col gap-3 xs:flex-row-reverse">
							<Button
								className="min-w-24"
								disabled={!trimmed}
								type="submit"
								variant="primary"
							>
								بروزرسانی
							</Button>
							<Button type="button" variant="ghost" onClick={() => setOpen(false)}>
								بازگشت
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>
		</>
	);
}

export { EditTextItemAction };
