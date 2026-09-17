"use client";

import moment from "moment-jalaali";
import { useEffect, useState } from "react";
import { FaArrowRotateRight, FaFolder } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DateInput } from "@/components/ui/date-input";
import { useDialogs } from "@/components/ui/dialog/use-dialogs";
import { Input } from "@/components/ui/input";
import { EmailFolder, emailFolder } from "@/emails/enums/EmailFolder";
import { EmailType } from "@/emails/models/Email";
import {
	EmailFoldersType,
	EmailFoldersWithIconsType,
} from "@/emails/models/EmailContext";
import { getEmails } from "@/emails/services/getEmails";
import { cn } from "@/lib/utils";

import { useEmailsContext } from "../_module/EmailContext";
import { Email } from "./Email";
import { EmailsPage } from "./EmailsPage";
import { LoginEmailForm } from "./LoginEmailForm";
import { SendEmailModal } from "./SendEmailModal";

const EmailClient = () => {
	const dialogs = useDialogs();
	const { userConfiged, emailsFolders } = useEmailsContext();

	const [emailFoldersWithIcons, setEmailFoldersWithIcons] = useState<
		EmailFoldersWithIconsType[]
	>([]);

	const defaultFolders = (item: EmailFoldersType) => {
		return {
			name: item.folder,
			unread: item.unread,
			total: item.total,
			label: item.folder,
			icon: FaFolder,
		};
	};

	useEffect(() => {
		if (emailsFolders.length > 0) {
			const updatedFolders = emailsFolders.map((item: EmailFoldersType) => {
				const folderData =
					emailFolder[item.folder as EmailFolder] || defaultFolders(item);
				const Icon = folderData.icon;

				return {
					name: item.folder,
					unread: item.unread,
					total: item.total,
					label: folderData.title,
					icon: <Icon className="text-gray-500" size={20} />,
				};
			});

			setEmailFoldersWithIcons(updatedFolders);
		}
	}, [emailsFolders]);

	const [activeFolder, setActiveFolder] = useState<string>();
	const [activeEmail, setActiveEmail] = useState<EmailType | undefined>(
		undefined,
	);

	const [fetchNo, setFetchNo] = useState<number>(0);
	const [fromDate, setFromDate] = useState<string>("");
	const [toDate, setToDate] = useState<string>("");
	const [unread, setUnread] = useState<string>("");

	const [subjectSearchTerm, setSubjectSearchTerm] = useState<
		string | undefined
	>("");
	const [senderSearchTerm, setSenderSearchTerm] = useState<string | undefined>(
		"",
	);

	const [size, setSize] = useState<number>(6);
	const [countAllEmails, setCountAllEmails] = useState<number>(0);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [allEmails, setAllEmails] = useState<EmailType[]>();

	useEffect(() => {
		const fetchEmails = async () => {
			if (!activeFolder) return;
			setIsLoading(true);
			try {
				const res = await getEmails({
					folder: activeFolder,
					page: 0,
					size: size,
					subject: subjectSearchTerm,
					after: moment(fromDate, "jYYYY/jMM/jDD").format("YYYY-MM-DD"),
					before: moment(toDate, "jYYYY/jMM/jDD").format("YYYY-MM-DD"),
					unread: unread === "true" ? "true" : "",
					from: senderSearchTerm,
				});
				setAllEmails(res.data);
				setCountAllEmails(res.count);
			} catch (error) {
				console.error("خطا در دریافت ایمیل‌ها:", error);
			} finally {
				setIsLoading(false);
			}
		};
		fetchEmails();
	}, [
		activeFolder,
		fromDate,
		senderSearchTerm,
		size,
		subjectSearchTerm,
		toDate,
		unread,
		fetchNo,
	]);

	return (
		<div
			className={cn(
				userConfiged ? "border" : "border-0",
				"flex gap-2 rounded-lg bg-white p-3 sm:h-full",
			)}
		>
			{userConfiged ? (
				<>
					<div className="flex flex-col">
						<div className="flex w-full flex-col items-center border-b">
							<div className="flex w-full items-center gap-4">
								<Button
									onClick={async () => {
										await dialogs.open(SendEmailModal, {
											setFetchNo: setFetchNo,
										});
									}}
									variant="primary"
									className="mb-2 h-8 w-4/5"
								>
									ارسال ایمیل
								</Button>
								<Button
									onClick={() => {
										setFetchNo(fetchNo + 1);
									}}
									variant="primary"
									className="mb-2 h-8"
								>
									<FaArrowRotateRight />
								</Button>
							</div>

							<div className="text-md w-full">
								{emailFoldersWithIcons.map(
									(folder: EmailFoldersWithIconsType, index: number) => (
										<div
											key={index}
											onClick={() => {
												setActiveFolder(folder.name);
											}}
											className={cn(
												activeFolder === folder.name
													? "border-e-2 border-primary-400 bg-gray-100"
													: "bg-white",
												"flex cursor-pointer items-center gap-5 p-2",
											)}
										>
											{folder.icon}
											<span>{folder.label ?? folder.name}</span>
											<div
												className={cn(
													"ms-auto h-5 w-8 rounded-full pt-[1px] text-center",
													activeFolder === folder.name
														? "bg-primary text-blue-200"
														: "bg-white text-gray-500",
												)}
											>
												{folder.total}
											</div>
										</div>
									),
								)}
							</div>
						</div>
						<div className="x flex w-full flex-col items-start justify-start gap-4 p-4">
							{activeFolder === "INBOX" && (
								<div className="flex items-center gap-2">
									<Checkbox
										onCheckedChange={(checked) => {
											setUnread(checked ? "true" : "");
										}}
									/>
									<label className="shrink-0">خوانده نشده ها</label>
								</div>
							)}

							<Input
								onChange={(e) => {
									setTimeout(() => {
										setSubjectSearchTerm(e.target.value);
									}, 500);
								}}
								placeholder="جستجو موضوع"
							/>
							<Input
								onChange={(e) => {
									setTimeout(() => {
										setSenderSearchTerm(e.target.value);
									}, 500);
								}}
								placeholder="جستجو فرستنده"
							/>
							<div className="flex items-center gap-2">
								<label className="shrink-0">از تاریخ:</label>
								<DateInput
									maxDate={toDate}
									value={fromDate}
									onChange={(value: string | string[]) => {
										const newValue = Array.isArray(value) ? value[0] : value;
										setFromDate(newValue);
									}}
								/>
							</div>
							<div className="flex items-center gap-2">
								<label className="shrink-0">تا تاریخ:</label>
								<DateInput
									minDate={fromDate}
									value={toDate}
									onChange={(value: string | string[]) => {
										const newValue = Array.isArray(value) ? value[0] : value;
										setToDate(newValue);
									}}
								/>
							</div>
						</div>
					</div>

					<div className="flex w-full sm:flex-col md:flex-row">
						<div
							className={cn(
								"h-full sm:border-0 xl:min-w-[20rem] xl:max-w-[20rem]",
								activeEmail ? "sm:hidden sm:w-0 xl:block" : "sm:w-full",
							)}
						>
							<EmailsPage
								allEmails={allEmails}
								isLoading={isLoading}
								countAllEmails={countAllEmails}
								size={size}
								setSize={setSize}
								activeEmail={activeEmail}
								setActiveEmail={setActiveEmail}
							/>
						</div>

						<div
							className={cn(
								"ms-auto max-h-[75vh] w-full overflow-y-auto xl:flex",
								activeEmail ? "w-full" : "w-0",
							)}
						>
							{activeEmail ? (
								<Email
									setAllEmails={setAllEmails}
									emailFoldersWithIcons={emailFoldersWithIcons}
									activeFolder={activeFolder!}
									email={activeEmail as EmailType}
									setActiveEmail={setActiveEmail}
								/>
							) : (
								<></>
							)}
						</div>
					</div>
				</>
			) : (
				<LoginEmailForm />
			)}
		</div>
	);
};

export { EmailClient };
