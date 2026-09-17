import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import {
	FaCameraRotate,
	FaInfo,
	FaPenToSquare,
	FaPhotoFilm,
	FaTrash,
} from "react-icons/fa6";
import { toast } from "sonner";

import avatar from "@/assets/images/avatar.svg";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardIcon,
	CardNav,
	CardTitle,
} from "@/components/ui/card";
import { useDialogs } from "@/components/ui/dialog/use-dialogs";
import { Numeric } from "@/components/ui/numeric";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Personnel } from "@/hrm/personnel/models/Personnel";
import { AcademicDegree } from "@/hrm/shared/models/AcademicDegree";
import deleteUserDocumentFile from "@/identity/userDocuments/services/deleteUserDocumentFile";
import GetUserDocumentsFile from "@/identity/userDocuments/services/getUserDocumentsFile";
import PostUserDocument from "@/identity/userDocuments/services/postUserDocument";
import { cn } from "@/lib/utils";

import { User } from "../models/User";

const PersonnelEditDialog = dynamic(
	() =>
		import("@/hrm/personnel/components/personnel-update/PersonnelUpdateDialog"),
);

const UserInfo = ({
	parentPath,
	personnel,
	user,
	onChange,
}: {
	parentPath: string;
	personnel?: Personnel;
	user?: User;
	onChange: () => void;
}) => {
	const dialog = useDialogs();

	const [avatarId, setAvatarId] = useState<string | undefined>(user?.image?.id);
	const [userAvatar, setUserAvatar] = useState<any>();

	useEffect(() => {
		(async () => {
			try {
				if (!avatarId) {
					setUserAvatar(null);
					return;
				}

				let inspectorFile = await GetUserDocumentsFile({
					fileId: avatarId,
				});

				if (inspectorFile) {
					const files = new File([inspectorFile], "Avatar", {
						type: inspectorFile.type,
					});

					const reader = new FileReader();

					reader.onloadend = () => {
						const dataURL = reader.result;
						localStorage.setItem("userAvatar", dataURL as string);
						setUserAvatar(dataURL);
					};

					reader.readAsDataURL(files);
				}
			} catch {
				setUserAvatar(null);
			}
		})();
	}, [avatarId]);

	const handleEditPersonnel = useCallback(
		async (personnel: Personnel) => {
			const result = await dialog.open(PersonnelEditDialog, {
				personnel,
				parentPath,
			});

			if (result) {
				onChange();
			}
		},
		[dialog, parentPath, onChange],
	);

	const handleAvatarDelete = useCallback(async () => {
		try {
			await deleteUserDocumentFile({
				fileId: avatarId as string,
			});

			setAvatarId(undefined);
		} catch (err) {
			console.error(err);
			toast.error("خطای نامشخصی در هنگام حذف تصویر پروفایل رخ داد.");
		}
	}, [avatarId]);

	const handleAvatarUpload = useCallback(
		async (event: React.ChangeEvent<HTMLInputElement>) => {
			try {
				const file = event.target.files?.[0];

				if (!file) return;

				const formData = new FormData();
				formData.append("file", file);

				if (avatarId) {
					await deleteUserDocumentFile({
						fileId: avatarId,
					}).catch();
				}
				if (user) {
					const uploadedId = await PostUserDocument({
						file: file,
						title: "تصویر پروفایل",
						status: "confirm",
						key: "avatar",
						userId: user.id,
					}).then((res) => res.result.id);

					setAvatarId(uploadedId);
				}

				toast.success("تصویر پروفایل با موفقیت بارگذاری شد.");
			} catch (err) {
				toast.error("خطای نامشخصی در هنگام بارگذاری تصویر پروفایل رخ داد.");
			}
		},
		[avatarId, user],
	);

	useEffect(() => {
		console.info({ avatarId });
	}, [avatarId]);

	return (
		<Card>
			<CardHeader orientation="horizontal">
				<CardTitle>
					<CardIcon>
						<FaInfo />
					</CardIcon>
					{parentPath === "profile" ? "اطلاعات من" : "اطلاعات پرسنل"}
				</CardTitle>

				<CardNav>
					<Button
						variant="secondary"
						onClick={() => {
							handleEditPersonnel(personnel as Personnel);
						}}
					>
						<FaPenToSquare />
						ویرایش اطلاعات
					</Button>
				</CardNav>
			</CardHeader>

			<CardContent className="grid grid-cols-12 gap-6">
				{parentPath === "profile" && (
					<div className="col-span-full pb-2">
						<div className="relative h-24 w-24">
							<div className="relative z-20 flex flex-col items-center gap-2">
								<Image
									className="size-20 rounded-2xl border border-gray-100 bg-white shadow-md"
									draggable={false}
									src={userAvatar ?? avatar}
									alt="avatar"
									width={80}
									height={80}
								/>

								<div className="flex w-20 items-center justify-center gap-2">
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger>
												<div className="size-6">
													<input
														id="upload-avatar"
														type="file"
														accept="image/*"
														className="hidden"
														onChange={handleAvatarUpload}
													/>

													<label
														htmlFor="upload-avatar"
														className={cn(
															buttonVariants({
																size: "icon",
																variant: "ghost",
															}),
															"m-0 size-6 cursor-pointer bg-white",
														)}
													>
														{!!userAvatar ? (
															<FaCameraRotate size={20} />
														) : (
															<FaPhotoFilm size={16} />
														)}
													</label>
												</div>
											</TooltipTrigger>
											<TooltipContent>
												{!!userAvatar ? "تعویض آواتار" : "بارگذاری آواتار"}
											</TooltipContent>
										</Tooltip>

										{!!userAvatar && (
											<Tooltip>
												<TooltipTrigger asChild>
													<Button
														className="size-6 cursor-pointer bg-white"
														size="icon"
														variant="ghost"
														onClick={handleAvatarDelete}
													>
														<FaTrash />
													</Button>
												</TooltipTrigger>
												<TooltipContent>حذف آواتار</TooltipContent>
											</Tooltip>
										)}
									</TooltipProvider>
								</div>
							</div>

							<div className="absolute -bottom-1 z-10 h-8 w-full rounded-xl bg-gray-300"></div>
						</div>
					</div>
				)}

				<div className="col-span-6 !col-start-1 space-y-2">
					<div className="text-muted-foreground">نام کاربری</div>
					<div>{user?.username || personnel?.username || "-"}</div>
				</div>

				<div className="col-span-6 space-y-2 sm:col-span-6">
					<div className="text-muted-foreground">نام و نام خانوادگی</div>
					<div>{user?.fullname || personnel?.fullname}</div>
				</div>

				<div className="col-span-full space-y-2 sm:col-span-6">
					<div className="text-muted-foreground">کد ملی</div>
					<div>
						<Numeric
							value={user?.nationalCode || personnel?.nationalCode}
							placeholder="-"
						/>
					</div>
				</div>

				{personnel && (
					<div className="col-span-full space-y-2 sm:col-span-6">
						<div className="text-muted-foreground"> شماره شناسنامه</div>
						<div>
							<Numeric value={personnel.birthCertificateNo} placeholder="-" />
						</div>
					</div>
				)}

				<div className="col-span-full space-y-2 sm:col-span-6">
					<div className="text-muted-foreground">شماره همراه</div>
					<div>
						<Numeric
							value={user?.phoneNo || personnel?.phoneNo}
							placeholder="-"
						/>
					</div>
				</div>

				{personnel && (
					<div className="col-span-full space-y-2 sm:col-span-6">
						<div className="text-muted-foreground"> شماره ثابت</div>
						<div>
							<Numeric value={personnel.landlineNo} placeholder="-" />
						</div>
					</div>
				)}

				{personnel && (
					<div className="col-span-full space-y-2 sm:col-span-6">
						<div className="text-muted-foreground">محل تولد</div>
						<div>
							<Numeric value={personnel.birthPlace} placeholder="-" />
						</div>
					</div>
				)}

				{personnel && (
					<div className="col-span-full space-y-2 sm:col-span-6">
						<div className="text-muted-foreground">تاریخ تولد</div>
						<div>
							<Numeric value={personnel.birthDate} placeholder="-" />
						</div>
					</div>
				)}

				<div className="col-span-6 space-y-2 sm:col-span-6">
					<div className="text-muted-foreground">ایمیل</div>
					<div>{user?.email || personnel?.email || "-"}</div>
				</div>

				{personnel && (
					<div className="col-span-full space-y-2 sm:col-span-6">
						<div className="text-muted-foreground">شماره داخلی</div>
						<div>
							<Numeric value={personnel.internalPhoneNo} placeholder="-" />
						</div>
					</div>
				)}

				{personnel && (
					<div className="col-span-full space-y-2">
						<div className="text-muted-foreground">تحصیلات</div>
						<div>
							{!!personnel.academics.length
								? personnel.academics.map((x, index) => (
										<div key={index}>
											{x.level} {x.name} {x.field}
										</div>
									))
								: "-"}
						</div>
					</div>
				)}

				{personnel && (
					<div className="col-span-full space-y-2">
						<div className="text-muted-foreground">آدرس</div>
						<div>{personnel.address || "-"}</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
};

export { UserInfo };
