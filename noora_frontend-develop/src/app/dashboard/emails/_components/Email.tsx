"use client";

import { useEffect, useState } from "react";
import { FaDownload, FaPaperclip } from "react-icons/fa6";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useDialogs } from "@/components/ui/dialog/use-dialogs";
import { Spinner } from "@/components/ui/spinner";
import { EmailType } from "@/emails/models/Email";
import { EmailFoldersWithIconsType } from "@/emails/models/EmailContext";
import { getEmailAttachment } from "@/emails/services/getEmailAttachment";
import { sendEmailSeenStatus } from "@/emails/services/sendEmailSeenStatus";
import { Seperator } from "@/ui/Seperator";
import downloadBlob from "@/utils/downloadBlob";
import { isBlob } from "@/utils/isBlob";

import { SendEmailModal } from "./SendEmailModal";

const extensionMap = new Map([
	["image", "jpg"],
	["pdf", "pdf"],
	["text", "txt"],
	["audio", "mp3"],
	["video", "mp4"],
]);

const getFileExtension = (contentType: string): string => {
	for (const [key, extension] of extensionMap) {
		if (contentType.includes(key)) return extension;
	}

	return "bin";
};

type EmailProps = {
	email: EmailType;
	activeFolder: string;
	emailFoldersWithIcons: EmailFoldersWithIconsType[];
	setActiveEmail: React.Dispatch<React.SetStateAction<EmailType | undefined>>;
	setAllEmails: React.Dispatch<React.SetStateAction<EmailType[] | undefined>>;
};

const Email = ({
	email,
	activeFolder,
	emailFoldersWithIcons,
	setActiveEmail,
	setAllEmails,
}: EmailProps) => {
	const dialogs = useDialogs();

	const [isdownloading, setIsDownloading] = useState<number>();
	const downloadFile = async (uid: number, index: number) => {
		setIsDownloading(uid);
		try {
			const attachment = await getEmailAttachment({
				emailUid: uid,
				attachmentIndex: index,
			});

			if (!isBlob(attachment)) {
				console.error("The response is not a valid Blob.");
				return;
			}

			const extension = getFileExtension(attachment.type);
			downloadBlob({
				blob: attachment,
				filename: `attachment_${uid}_${index}.${extension}`,
				openInNewTab: true,
			});
		} catch (error) {
			console.error(error);
			toast.error("خطای نامشخصی در هنگام دریافت پیوست رخ داد.");
		}
		setIsDownloading(undefined);
	};

	useEffect(() => {
		if (email.isUnread) {
			const markAsSeen = async () => {
				try {
					const res = await sendEmailSeenStatus({
						messageUid: String(email.uid),
						folder: activeFolder,
						seen: "true",
					});

					setActiveEmail((prevEmail) => {
						if (prevEmail && prevEmail.uid === email.uid) {
							return { ...prevEmail, isUnread: false };
						}
					});

					setAllEmails((prevEmails) => {
						if (!prevEmails) return prevEmails;

						const updatedEmails = prevEmails.map((e) =>
							e.uid === email.uid ? { ...e, isUnread: false } : e,
						);

						return updatedEmails;
					});

					const index = emailFoldersWithIcons.findIndex(
						(folder: EmailFoldersWithIconsType) => folder.name === activeFolder,
					);

					if (index !== -1) {
						emailFoldersWithIcons[index].unread -= 1;
					}
				} catch (error) {
					console.error(error);
				}
			};

			markAsSeen();
		}
	}, [
		email.uid,
		email.isUnread,
		activeFolder,
		emailFoldersWithIcons,
		setActiveEmail,
		setAllEmails,
	]);

	return (
		<div className="ms-2 flex min-h-full w-full flex-col gap-6 rounded-lg bg-white p-6">
			<div className="flex items-center gap-3 text-primary">
				<div className="flex flex-col">
					<span className="text-lg font-semibold">{email.from[0]?.name}</span>
					<span className="text-sm text-gray-500">
						{email.from[0]?.address}
					</span>
				</div>
				<div className="ms-auto flex items-center gap-4 text-xs text-gray-500">
					{new Date(email?.date).toLocaleDateString("fa-IR")}
					{email && (
						<div className="flex gap-x-4">
							<ForwardEmailButton email={email} activeFolder={activeFolder} />
							<ReplyEmailButton email={email} activeFolder={activeFolder} />

							<Button
								variant="primary"
								onClick={() => setActiveEmail(undefined)}
								className="m-2 ms-auto sm:block"
							>
								بازگشت
							</Button>
						</div>
					)}
				</div>
			</div>

			<div className="flex flex-col gap-1 text-gray-600">
				<span className="text-lg text-black">{email.subject}</span>
			</div>

			<Seperator />

			<div className="rounded-lg border p-4">
				<div
					className="mt-2 text-end text-sm leading-6 text-gray-800"
					dangerouslySetInnerHTML={{ __html: email.html }}
				/>
			</div>

			{(email.attachments?.length ?? 0) > 0 && (
				<div className="mt-4 rounded-lg border bg-gray-100 p-4">
					<div className="mb-2 flex items-center gap-2">
						<FaPaperclip className="text-gray-500" />
						<span className="text-sm font-semibold text-gray-700">
							فایل‌های پیوست:
						</span>
					</div>
					<div className="flex flex-wrap gap-2">
						{email.attachments!.map((attachment, index) => (
							<>
								{isdownloading === email.uid ? (
									<Spinner />
								) : (
									<Button
										key={index}
										variant="outline"
										className="flex items-center gap-2 px-4 py-2 text-sm font-medium"
										onClick={() => downloadFile(email.uid, index)}
									>
										<FaDownload className="text-gray-600" />
										{attachment.filename}
									</Button>
								)}
							</>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export { Email };

const ReplyEmailButton = ({
	email,
	activeFolder,
}: {
	email: EmailType;
	activeFolder: string;
}) => {
	const dialogs = useDialogs();
	return (
		<Button
			onClick={async () => {
				const payload = {
					subject: `---------- Reply message ---------: ${email.subject}`,
					emailType: "reply",
					messageUid: String(email.uid),
					folder: activeFolder,
					html: email.html,
					files:
						email.attachments?.map(
							(attachment) =>
								new File([], attachment.filename, {
									type: attachment.contentType,
								}),
						) ?? [],
				};
				await dialogs.open(SendEmailModal, payload);
			}}
			variant="secondary"
			className="m-2 ms-auto sm:block"
		>
			Reply
		</Button>
	);
};

const ForwardEmailButton = ({
	email,
	activeFolder,
}: {
	email: EmailType;
	activeFolder: string;
}) => {
	const dialogs = useDialogs();
	return (
		<Button
			onClick={async () => {
				const payload = {
					subject: `---------- Forwarded message ---------: ${email.subject}`,
					emailType: "forward",
					messageUid: String(email.uid),
					folder: activeFolder,
					html: email.html,
					files:
						email.attachments?.map(
							(attachment) =>
								new File([], attachment.filename, {
									type: attachment.contentType,
								}),
						) ?? [],
				};
				await dialogs.open(SendEmailModal, payload);
			}}
			variant="secondary"
			className="m-2 ms-auto sm:block"
		>
			Forward
		</Button>
	);
};
