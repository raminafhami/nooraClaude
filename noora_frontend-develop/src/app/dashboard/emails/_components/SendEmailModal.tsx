"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaTrash } from "react-icons/fa6";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { DialogProps } from "@/components/ui/dialog/use-dialogs";
import FileDropzone from "@/components/ui/file-dropzone";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { forwardEmailRequest } from "@/emails/services/forwardEmail";
import { replyEmailRequest } from "@/emails/services/replyEmail";
import { sendEmailRequest } from "@/emails/services/sendEmail";
import { messages } from "@/messages";
import { TinyEditor } from "@/secretariat/flows/outgoing-letter/components/TinyEditor";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z
	.object({
		subject: z.string().min(1, messages.validation.required),
		to: z
			.array(z.string().email(messages.validation.invalid("ایمیل")))
			.min(1, messages.validation.required),
		html: z.string().min(1, messages.validation.required),
		cc: z
			.array(z.string().email(messages.validation.invalid("ایمیل")))
			.optional(),
		bcc: z
			.array(z.string().email(messages.validation.invalid("ایمیل")))
			.optional(),
		isUserEmail: z.boolean(),
		files: z.array(z.instanceof(File)).optional(),
		emailType: z.string().optional(),
		messageUid: z.string().optional(),
		folder: z.string().optional(),
		from: z.string(),
	})
	.refine(
		(data) => {
			if (data.emailType !== "reply") {
				return data.to && data.to.length > 0;
			}
			return true;
		},
		{ message: "ایمیل گیرنده الزامی است", path: ["to"] },
	);

type FormSchema = z.infer<typeof schema>;

type SendEmailModalProps = DialogProps<
	Partial<FormSchema> & {
		setFetchNo?: React.Dispatch<React.SetStateAction<number>>;
	}
>;

const SendEmailModal: React.FC<SendEmailModalProps> = ({
	payload: emailModalType,
	open,
	onClose,
}) => {
	const form = useForm<FormSchema>({
		defaultValues: {
			subject: emailModalType?.emailType === "forward" || "reply" ? " " : "",
			to:
				emailModalType?.emailType === "reply" ? ["doesntmatter@gmail.com"] : [],
			html: emailModalType?.emailType === "forward" ? "." : "",
			cc: [],
			bcc: [],
			from: emailModalType?.from ?? "",
			isUserEmail: true,
			files: emailModalType?.files ?? [],
			emailType: emailModalType?.emailType ?? "new",
			messageUid: emailModalType?.messageUid ?? "",
			folder: emailModalType?.folder ?? "",
		},
		resolver: zodResolver(schema),
	});

	const {
		control,
		handleSubmit,
		watch,
		setValue,
		getValues,
		formState: { isSubmitting, errors },
	} = form;

	const [isLoadingSubmit, setIsLoadingSubmit] = useState<boolean>(false);

	async function onSubmit(values: FormSchema) {
		setIsLoadingSubmit(true);
		try {
			if (values.emailType === "forward") {
				await forwardEmailRequest({
					data: {
						subject: values.subject,
						to: values.to[0],
						html: values.html,
						isUserEmail: values.isUserEmail,
						includeAttachments: false,
						files: values.files,
						messageUid: values.messageUid,
						folder: values.folder,
					},
				});
			} else if (values.emailType === "reply") {
				await replyEmailRequest({
					data: {
						subject: values.subject,
						html: values.html,
						messageUid: values.messageUid,
						folder: values.folder,
						files: values.files,
						isReplyAll: false,
					},
				});
			} else {
				await sendEmailRequest({
					data: {
						subject: values.subject,
						to: values.to,
						bcc: values.bcc,
						cc: values.cc,
						html: values.html,
						isUserEmail: values.isUserEmail,
						files: values.files,
					},
				});
				const setFetchNo = emailModalType?.setFetchNo;
				if (setFetchNo) setFetchNo((prev) => prev + 1);
			}

			toast.success("با موفقیت ارسال شد");
			onClose();
		} catch (err: any) {
			console.error(err);
			toast.error("خطای نامشخصی رخ داد.");
		} finally {
			setIsLoadingSubmit(false);
		}
	}

	const [toInput, setToInput] = useState("");
	const [ccInput, setCcInput] = useState("");
	const [bccInput, setBccInput] = useState("");

	const ccList = watch("cc") || [];
	const bccList = watch("bcc") || [];
	const toList = watch("to") || [];

	const handleAddEmail = (type: "cc" | "bcc" | "to", email: string) => {
		if (email.trim() === "") return;
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			toast.error("ایمیل وارد شده نامعتبر است!");
			return;
		}
		const listName = watch(`${type}`) || [];
		setValue(`${type}`, [...listName, email]);
		if (type === "cc") {
			setCcInput("");
		} else if (type === "bcc") {
			setBccInput("");
		} else {
			setToInput("");
		}
	};

	const handleRemoveEmail = (type: "cc" | "bcc" | "to", email: string) => {
		const listName = watch(`${type}`) || [];
		setValue(
			type,
			listName.filter((item: string) => item !== email),
		);
	};

	return (
		<Dialog open={open} onOpenChange={onClose.bind(null, undefined)}>
			<DialogContent className="max-w-screen-md">
				<DialogHeader>
					<DialogTitle>ارسال ایمیل</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={handleSubmit(onSubmit)}>
						<fieldset className="space-y-8" disabled={isSubmitting}>
							{getValues("emailType") !== "reply" &&
								getValues("emailType") !== "forward" && (
									<FormField
										control={control}
										name="subject"
										render={({ field }) => (
											<FormItem>
												<FormLabel>موضوع</FormLabel>
												<FormControl>
													<Input {...field} />
												</FormControl>
												<FormMessage>{errors.subject?.message}</FormMessage>
											</FormItem>
										)}
									/>
								)}

							{getValues("emailType") !== "reply" && (
								<FormItem>
									<FormLabel>مقصد</FormLabel>
									<FormControl>
										<div className="flex gap-4">
											<Input
												value={toInput}
												onChange={(e) => setToInput(e.target.value)}
											/>
											<Button
												type="button"
												onClick={() => handleAddEmail("to", toInput)}
											>
												افزودن
											</Button>
										</div>
									</FormControl>
									<FormMessage>{errors.to?.message}</FormMessage>

									<div className="mt-2 flex flex-wrap gap-2">
										{toList.map((email, index) => (
											<div
												key={index}
												className="flex items-center gap-2 rounded bg-gray-200 p-2"
											>
												<span>{email}</span>
												<Button
													variant="ghost"
													type="button"
													size="sm"
													onClick={() => handleRemoveEmail("to", email)}
												>
													<FaTrash />
												</Button>
											</div>
										))}
									</div>
								</FormItem>
							)}

							<FormField
								control={control}
								name="html"
								render={({ field }) => (
									<FormItem className="w-full">
										<FormLabel>متن نامه</FormLabel>
										<FormControl>
											<TinyEditor {...field} />
										</FormControl>
										<FormMessage>{errors.html?.message}</FormMessage>
									</FormItem>
								)}
							/>
							{emailModalType.emailType !== "reply" && (
								<FormItem>
									<FormLabel>CC</FormLabel>
									<FormControl>
										<div className="flex gap-4">
											<Input
												value={ccInput}
												onChange={(e) => setCcInput(e.target.value)}
											/>
											<Button
												type="button"
												onClick={() => handleAddEmail("cc", ccInput)}
											>
												افزودن
											</Button>
										</div>
									</FormControl>
									<div className="mt-2 flex flex-wrap gap-2">
										{ccList.map((email, index) => (
											<div
												key={index}
												className="flex items-center gap-2 rounded bg-gray-200 p-2"
											>
												<span>{email}</span>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													onClick={() => handleRemoveEmail("cc", email)}
												>
													<FaTrash />
												</Button>
											</div>
										))}
									</div>
								</FormItem>
							)}

							<FormItem>
								<FormLabel>BCC</FormLabel>
								<FormControl>
									<div className="flex gap-4">
										<Input
											value={bccInput}
											onChange={(e) => setBccInput(e.target.value)}
										/>
										<Button
											type="button"
											onClick={() => handleAddEmail("bcc", bccInput)}
										>
											افزودن
										</Button>
									</div>
								</FormControl>
								<div className="mt-2 flex flex-wrap gap-2">
									{bccList.map((email, index) => (
										<div
											key={index}
											className="flex items-center gap-2 rounded bg-gray-200 p-2"
										>
											<span>{email}</span>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={() => handleRemoveEmail("bcc", email)}
											>
												<FaTrash />
											</Button>
										</div>
									))}
								</div>
							</FormItem>

							<FormField
								control={control}
								name="files"
								render={({ field }) => (
									<FormItem>
										<FormLabel>فایل ها</FormLabel>
										<FormControl>
											<FileDropzone
												initialFiles={field.value ?? emailModalType?.files}
												onFilesAdded={(files) => {
													setValue("files", files);
												}}
											/>
										</FormControl>
										<FormMessage>{errors.files?.message}</FormMessage>
									</FormItem>
								)}
							/>

							<div className="flex flex-col gap-3 xs:flex-row-reverse">
								<Button className="xs:min-w-24" variant="primary" type="submit">
									ارسال
									{isLoadingSubmit && (
										<span className="ml-2">درحال ارسال...</span>
									)}
								</Button>

								<Button
									type="button"
									variant="ghost"
									onClick={onClose.bind(null, undefined)}
								>
									لغو
								</Button>
							</div>
						</fieldset>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};

export { SendEmailModal };
