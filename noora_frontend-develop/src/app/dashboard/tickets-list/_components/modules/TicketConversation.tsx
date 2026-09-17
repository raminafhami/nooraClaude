"use client";

import moment from "jalali-moment";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { CgDanger } from "react-icons/cg";
import { FaFile } from "react-icons/fa6";
import { RiUserReceived2Fill } from "react-icons/ri";
import { TbReload } from "react-icons/tb";
import { Tooltip } from "react-tooltip";
import { toast } from "sonner";

import GetTicketFile from "@/api/ticketsapi/getTicketFile";
import PostNewTicketsMessage from "@/api/ticketsapi/postNewTicketsMessage";
import PutTicketClaim from "@/api/ticketsapi/putTicketClaim";
import Avatar from "@/assets/images/avatar.svg";
import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import GetAllUserDocuments from "@/identity/userDocuments/services/getAllUserDocuments";
import GetUserDocumentsFile from "@/identity/userDocuments/services/getUserDocumentsFile";
import { cn } from "@/lib/utils";
import PostNotifications from "@/notifications/services/postNotification";
import { useSocket } from "@/socket/useSocket";
import { Loading } from "@/ui/Loader";
import { toFarsiNum } from "@/utils/string/toFarsiNum";

interface TicketConversation {
	data: any;
	getData: () => void;
}

export default function TicketConversation({
	data,
	getData,
}: TicketConversation) {
	const { identity } = useLoggedInUser();

	const { notificationsSocket } = useSocket();

	useEffect(() => {
		if (!notificationsSocket) return;

		function handleNewNotification(notification: any) {
			setSocketUpdate(notification);
		}

		notificationsSocket.on("newNotification", handleNewNotification);

		return () => {
			notificationsSocket.off("newNotification", handleNewNotification);
		};
	}, [notificationsSocket]);

	const [message, setMessage] = useState<string>("");
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [loadingAvatar, setLoadingAvatar] = useState<boolean>(false);
	const [temp, setTemp] = useState<string>();
	const [fileTemp, setFileTemp] = useState<string>();
	const [field, setField] = useState<boolean>(false);
	const [socketUpdate, setSocketUpdate] = useState<any>();
	const [userAvatar, setUserAvatar] = useState();

	const getUserAvatar = useCallback(async () => {
		setLoadingAvatar(true);
		const userId =
			identity.id === data?.createdBy?.id
				? data?.assignee?.id
				: data?.createdBy?.id;

		if (!userId) {
			return;
		}

		try {
			let userDocs = await GetAllUserDocuments({
				userId,
				page: 0,
				size: 99,
				key: "avatar",
			});

			if (userDocs) {
				let inspectorFile = await GetUserDocumentsFile({
					fileId: userDocs[0].id,
				});

				if (inspectorFile) {
					const files = new File([inspectorFile], `Avatar`, {
						type: inspectorFile.type,
					});
					const reader = new FileReader();
					reader.onloadend = () => {
						const dataURL = reader.result;
						setUserAvatar(dataURL ?? Avatar);
					};
					reader.readAsDataURL(files);
				}
			}
		} catch {
			setUserAvatar(Avatar);
		} finally {
			setLoadingAvatar(false);
		}
	}, [data.assignee?.id, data.createdBy?.id, identity.id]);

	useEffect(() => {
		getUserAvatar();
	}, [data, getUserAvatar]);

	async function postNewMessage(temp?: string, file?: any) {
		try {
			let content = message ? message : temp ? temp : undefined;
			let files = file ? file : undefined;
			setTemp(message);
			setFileTemp(file?.name);
			setMessage("");
			let res = await PostNewTicketsMessage({
				ticketId: data.id,
				content,
				file: files,
			}).then(async (res) => {
				const notificationRes = await PostNotifications({
					title: `یک پیام از طرف ${identity?.fullname} برای شما ارسال شد.`,
					description:
						res.result.type === "TEXT"
							? res.result.content
							: "یک فایل ارسال شد.",
					category: `tickets:${data?.id}`,
					groups: [],
					users:
						identity?.id === data.createdBy?.id
							? [data.assignee?.id]
							: [data.createdBy?.id],
					priority:
						data?.priority === 3
							? "high"
							: data.priority === 2
								? "medium"
								: "low",
					sendNotification: true,
				});

				setTimeout(() => {
					getData();
					setField(false);
				}, 300);
			});
		} catch (e: any) {
			toast.error(e.response.data.message);
			setField(true);
		}
	}

	const inputRef: any = useRef(null);

	const handleClick = () => {
		inputRef.current.click();
	};

	const handleFileChange = ({ target: { files } }: any) => {
		postNewMessage(undefined, files[0]);
	};

	async function getFile(fileId: string) {
		setIsLoading(true);
		try {
			toast.loading("در حال بارگزاری...");
			let res = GetTicketFile({ fileId, ticketId: data.id });
			res.then((res) => {
				if (res) {
					setTimeout(() => {
						const url = URL.createObjectURL(res);
						window.open(url, "_blank");
						setIsLoading(false);
					}, 300);
				}
			});
		} catch (e) {
			toast.error("خطایی در دریافت دسته بندی ها رخ داد!");
			setIsLoading(false);
		}
	}

	async function claimTicket(id: string) {
		setIsLoading(true);
		try {
			let res = await PutTicketClaim({ id });
			if (res) {
				setTimeout(() => {
					toast.success("با موفقیت اختصاص داده شد!");
					getData();
					setIsLoading(false);
				}, 300);
			}
		} catch (e: any) {
			setIsLoading(false);
			toast.error(e.response.data.message);
		}
	}

	useEffect(() => {
		setTemp("");
		setFileTemp(undefined);
	}, [data]);

	useEffect(() => {
		if (
			socketUpdate?.category?.includes("tickets") &&
			socketUpdate?.category?.slice(8) === data?.id
		) {
			getData();
		}
	}, [data?.id, getData, socketUpdate]);

	return (
		<>
			<div className="p:2 flex h-[60vh] flex-1 flex-col justify-between rounded-none bg-zinc-100 sm:p-6">
				<div className="flex justify-between rounded border-b-2 border-gray-200 py-3 sm:items-center">
					<div className="relative flex w-full items-center space-x-4 bg-white p-2">
						<div className="relative">
							{loadingAvatar ? (
								<Image
									alt="profile"
									src={Avatar}
									width={64}
									height={64}
									className="max-h-[64px] max-w-[64px] rounded-full border"
								/>
							) : (
								<Image
									src={userAvatar ?? Avatar}
									alt="profile"
									className={cn(
										"max-h-[64px] max-w-[64px] rounded-full border",
										!userAvatar && "bg-gray-200 p-2",
									)}
									width={64}
									height={64}
								/>
							)}
						</div>

						<div className="flex flex-col leading-tight">
							<div className="mt-1 flex items-center text-lg">
								<span className="mr-3 pb-2 text-gray-700">
									{data?.assignee ? (
										<>
											{data?.assignee?.id !== identity.id &&
											data?.createdBy?.id !== identity.id ? (
												<div className="gap-x-2">
													<>
														{data.assignee?.name} {data.assignee?.lastname}
													</>
													<>
														{" - "}
														{data.createdBy?.name} {data.createdBy?.lastname}
													</>
												</div>
											) : (
												<>
													{data?.assignee?.id === identity.id ? (
														<>
															{data.createdBy?.name} {data.createdBy?.lastname}
														</>
													) : (
														<>
															{data.assignee?.name} {data.assignee?.lastname}
														</>
													)}
												</>
											)}
										</>
									) : (
										<>
											{data.assignee ? (
												`${data?.assignee.name} ${data?.assignee.lastname}`
											) : (
												<>
													{identity.groups.includes(data?.group) ? (
														<>
															<RiUserReceived2Fill
																onClick={() => claimTicket(data.id)}
																data-tooltip-id={`assigne`}
																size={22}
																className="flex-inline btn cursor-pointer items-center rounded bg-gray-100 px-1 py-1 text-black hover:bg-blue-400 hover:text-white"
															/>
														</>
													) : (
														<>-</>
													)}
												</>
											)}
										</>
									)}
								</span>
							</div>
							<span className="mr-3 text-sm text-gray-600"></span>
						</div>
					</div>
				</div>

				{isLoading ? (
					<Spinner />
				) : (
					<div
						id="messages"
						className="scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch flex h-full flex-col-reverse justify-start space-y-4 overflow-y-auto p-3"
					>
						<div className="chat-message">
							<div className="mb-2 flex w-full flex-row-reverse items-start justify-end">
								<div className="flex w-full flex-col-reverse items-start">
									{temp && temp?.length > 1 && (
										<div
											className={`m-2 flex max-w-xs flex-col items-start space-y-2 text-xs`}
										>
											<div className="relative">
												<span
													className={`inline-block rounded-lg rounded-br-none bg-blue-600 px-4 py-2 text-white`}
												>
													{temp}
												</span>
											</div>

											<span
												className={`absolute left-[-3.7rem] w-full text-left text-gray-600`}
											>
												{field && (
													<CgDanger size={18} className="text-red-500" />
												)}
											</span>

											<span className={`w-full text-left text-gray-600`}>
												{field ? (
													<div className="flex items-center">
														<span> ارسال ناموفق بود</span>
														<TbReload
															onClick={() => {
																postNewMessage(temp);
															}}
															size={16}
															className="mr-1 cursor-pointer text-blue-500 hover:text-blue-700"
														/>
													</div>
												) : (
													<Loading className="w-full" size={"sm"} />
												)}
											</span>
										</div>
									)}

									{fileTemp && fileTemp?.length > 1 && (
										<div
											className={`m-2 flex max-w-xs flex-col items-start space-y-2 text-xs`}
										>
											<div className="relative">
												<span
													className={`inline-block rounded-lg rounded-br-none bg-blue-600 px-4 py-2 text-white`}
												>
													{fileTemp}
												</span>
											</div>

											<span
												className={`absolute left-[-3.7rem] w-full text-left text-gray-600`}
											>
												{field && (
													<CgDanger size={18} className="text-red-500" />
												)}
											</span>

											<span className={`w-full text-left text-gray-600`}>
												{field ? (
													<div className="flex items-center">
														<span> ارسال ناموفق بود</span>
														<TbReload
															onClick={() => {
																postNewMessage(temp);
															}}
															size={16}
															className="mr-1 cursor-pointer text-blue-500 hover:text-blue-700"
														/>
													</div>
												) : (
													<Loading className="w-full" size={"sm"} />
												)}
											</span>
										</div>
									)}

									{identity.id
										? data?.messages?.map((detail: any) => (
												<div
													key={detail.id}
													className={`m-2 flex max-w-xs flex-col space-y-2 text-xs ${
														identity.id === detail?.createdBy?.id
															? "items-start"
															: "items-end self-end"
													}`}
												>
													<div>
														<span
															onClick={() =>
																detail?.type === "FILE" &&
																getFile(detail?.file?.id)
															}
															className={`flex items-center justify-center gap-x-2 whitespace-pre-line rounded-lg px-4 py-2 ${
																identity.id === detail?.createdBy?.id
																	? "rounded-br-none bg-primary-500 text-white"
																	: "rounded-bl-none bg-white text-gray-500"
															} ${detail?.type === "FILE" && "cursor-pointer"} `}
														>
															<div className="max-w-[22rem] whitespace-pre-wrap break-words">
																{detail.content}
															</div>

															{detail?.type === "FILE" && (
																<div
																	className={cn(
																		`${identity.id === detail?.createdBy?.id ? "bg-primary-300" : "bg-gray-200"} rounded p-2`,
																	)}
																>
																	<FaFile size={18} />
																</div>
															)}
														</span>
													</div>

													<span
														className={`w-full text-gray-600 ${
															identity.id === detail?.createdBy?.id
																? "text-right"
																: "text-left"
														}`}
													>
														{detail?.createdAt
															? toFarsiNum(
																	moment(detail?.createdAt)
																		.locale("fa")
																		.format("HH:mm - YYYY/MM/DD"),
																)
															: ""}
													</span>
												</div>
											))
										: ""}
								</div>
							</div>
						</div>
					</div>
				)}

				{(identity.id === data?.assignee?.id ||
					identity.id === data?.createdBy?.id) && (
					<div className="mb-2 border-t-2 border-gray-200 pt-4 sm:mb-0">
						<div className="relative flex bg-white">
							<textarea
								disabled={["closed", "in-progress", "on-hold"].includes(
									data.status,
								)}
								value={message}
								onChange={(event) => {
									setMessage(event.target.value);
								}}
								placeholder="پیام خود را وارد کنید..."
								className="w-full rounded-md border-gray-200 py-3 pl-36 pr-2 text-gray-600 placeholder-gray-400 focus:placeholder-gray-400 focus:outline-none"
							/>
							<input
								style={{ display: "none" }}
								ref={inputRef}
								type="file"
								onChange={handleFileChange}
							/>
							<div className="absolute inset-y-0 left-0 items-center justify-end p-2 sm:flex">
								<button
									onClick={handleClick}
									type="button"
									className="ml-2 inline-flex h-10 w-10 min-w-[2rem] items-center justify-center rounded-full text-gray-500 transition duration-500 ease-in-out hover:bg-gray-300 focus:outline-none"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										className="h-5 w-5 text-gray-600"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
										></path>
									</svg>
								</button>
								<Button
									size={"sm"}
									variant="primary"
									onClick={() => {
										message?.length > 0 && postNewMessage();
									}}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 20 20"
										fill="currentColor"
										className="h-5 w-5 -rotate-90 transform"
									>
										<path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
									</svg>
								</Button>
							</div>
						</div>
					</div>
				)}

				<Tooltip id={`assigne`}>اختصاص به من</Tooltip>
			</div>
		</>
	);
}
