"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { EmailType } from "@/emails/models/Email";
import { cn } from "@/lib/utils";

const renderPlainText = (html?: string) => {
	const safeHtml = typeof html === "string" ? html : "";
	const plainText = safeHtml
		.replace(/<[^>]*>/g, "")
		.replace(/&nbsp;/g, " ")
		.replace(/&amp;/g, "&")
		.trim();

	return plainText.length > 50 ? plainText.slice(0, 50) + " ..." : plainText;
};

const getShortSubject = (subject: string) => {
	const words = subject?.split(/\s+/).filter(Boolean);
	return words?.length > 3 ? words.slice(0, 3).join(" ") + " ..." : subject;
};

type EmailsPageProps = {
	allEmails: EmailType[] | undefined;
	isLoading: boolean;
	countAllEmails: number;
	size: number;
	setSize: React.Dispatch<React.SetStateAction<number>>;
	activeEmail: EmailType | undefined;
	setActiveEmail: React.Dispatch<React.SetStateAction<EmailType | undefined>>;
};

const EmailsPage = ({
	allEmails,
	isLoading,
	countAllEmails,
	size,
	setSize,
	activeEmail,
	setActiveEmail,
}: EmailsPageProps) => {
	return (
		<div className="h-[40rem] overflow-y-auto rounded-lg border bg-gray-50">
			<>
				{(allEmails?.length ?? 0) > 0 ? (
					<>
						{allEmails?.map((email, index) => (
							<div
								onClick={() => setActiveEmail(email)}
								key={index}
								className={cn(
									"flex max-h-28 min-h-28 cursor-pointer flex-col gap-y-1 border-b p-4",
									activeEmail?.uid === email.uid &&
										"border-b-0 border-l-2 border-primary-400 bg-gray-200",
								)}
							>
								<div className="flex justify-between">
									<div className="text-xs text-muted-foreground">
										{email.from[0].name}
									</div>
									{email.isUnread && (
										<div className="me-5 ms-auto rounded-lg bg-primary-450 px-2 text-white">
											جدید
										</div>
									)}
									<div className="text-muted-foreground">
										{new Date(email?.date).toLocaleDateString("fa-IR")}
									</div>
								</div>
								<div className="text-base">
									{getShortSubject(email.subject)}
								</div>
								<div className="text-xs text-muted-foreground">
									{renderPlainText(email.html)}
								</div>
							</div>
						))}
					</>
				) : (
					<div className="flex min-h-[40rem] items-center justify-center">
						موردی برای نمایش یافت نشد
					</div>
				)}

				{(allEmails?.length ?? 0) < countAllEmails && (
					<div className="w-full bg-gray-100">
						<Button
							variant="secondary"
							className="w-full rounded-none"
							onClick={() => setSize(size + 6)}
						>
							موارد بیشتر
						</Button>
					</div>
				)}

				{isLoading && (
					<div className="flex min-h-[40rem] items-center justify-center">
						<Spinner loading />
					</div>
				)}
			</>
		</div>
	);
};

export { EmailsPage };
