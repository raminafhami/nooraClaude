import { useContext, useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Tooltip } from "react-tooltip";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { FieldError } from "@/form/FieldError";
import { Input } from "@/form/Input";
import { UserDocument } from "@/identity/userDocuments/models/UserDocument";
import DeleteUserDocumentsFile from "@/identity/userDocuments/services/deleteUserDocumentFile";
import GetAllUserDocuments from "@/identity/userDocuments/services/getAllUserDocuments";
import GetUserDocumentsFile from "@/identity/userDocuments/services/getUserDocumentsFile";
import PostUserDocument from "@/identity/userDocuments/services/postUserDocument";
import { messages } from "@/messages";
import FileInput from "@/ui/FileInput";
import { Loading } from "@/ui/Loader";
import SignaturePad from "@/ui/SignaturePad";

import { PersonnelContext } from "../_components/PersonnelContext";

interface FormData {
	nationalFrontCard: File;
	nationalBackCard: File;
	birthCertificate: File;
	birthCertificateMarriagePage: File;
	degree: File;
	other: { title: string; file: File | Blob; id: string }[];
	personnelPhoto: File;
	militaryCard: File;
	signature: File;
	criminalRecord: File;
}

export function Documents() {
	const [loading, setLoading] = useState<boolean>(true);
	const [pageLoading, setPageLoading] = useState<boolean>(true);
	const [documents, setDocuments] = useState<UserDocument[]>([]);
	const [otherDoc, setOtherDoc] = useState<
		{ title: string; file: File | Blob; id: string }[]
	>([]);

	const { personnel } = useContext(PersonnelContext);

	const methods = useForm<FormData>({
		mode: "onTouched",
		defaultValues: {
			other: [],
		},
	});

	const { formState, register, setValue, trigger, watch, control } = methods;
	const { errors } = formState;
	const fields = watch();

	const { append, remove } = useFieldArray({
		control,
		name: "other",
	});

	useEffect(() => {
		register("birthCertificate", {
			required: messages.validation.required,
		});
		register("birthCertificateMarriagePage", {
			required: messages.validation.required,
		});
		register("degree", {
			required: messages.validation.required,
		});
		register("militaryCard", {
			required: messages.validation.required,
		});
		register("nationalBackCard", {
			required: messages.validation.required,
		});
		register("nationalFrontCard", {
			required: messages.validation.required,
		});
		register("personnelPhoto", {
			required: messages.validation.required,
		});
		register("signature", {
			required: messages.validation.required,
		});
	}, []);

	useEffect(() => {
		getDocuments();
	}, []);

	useEffect(() => {
		setValue("other", otherDoc);
	}, [otherDoc]);

	async function getDocuments() {
		setLoading(true);
		setPageLoading(true);
		try {
			const document = await GetAllUserDocuments({
				page: 0,
				size: 999,
				userId: personnel.userId,
			});
			setDocuments(document);
			setPageLoading(false);
			await Promise.all(
				document.map(async (doc: UserDocument) => {
					await getFile(doc.id, doc.key, doc.title);
				}),
			);
		} catch (error) {
			toast.error("خطایی در دریافت مدارک رخ داد!");
		} finally {
			setPageLoading(false);
			setLoading(false);
		}
	}

	async function getFile(fileId: string, key: string | null, title: string) {
		try {
			const res: Blob = await GetUserDocumentsFile({ fileId: fileId });
			if (res) {
				if (key) {
					setValue(key as any, res);
				} else {
					setOtherDoc((prev) => [
						...prev,
						{
							title,
							file: res,
							id: fileId,
						},
					]);
				}
			}
		} catch (error) {
			toast.error("خطایی در دریافت مدارک رخ داد!");
		}
	}

	const handleAddDegree = () => {
		append({
			title: "",
			file: undefined as any,
			id: "",
		});
	};

	const uploadFile = async ({
		title,
		key,
		v,
	}: {
		title: string;
		key?: string;
		v: File;
	}) => {
		try {
			setLoading(true);
			await PostUserDocument({
				file: v,
				title,
				status: "confirm",
				key,

				userId: personnel.userId,
			}).then((res) => {
				setDocuments((prev) => [...prev, res.result]);
				if (res.result.key === null) {
					setOtherDoc((prev) => [
						...prev,
						{
							title,
							file: v,
							id: res.result.id,
						},
					]);
				}
			});

			return Promise.resolve();
		} catch (error) {
			toast.error("مشکلی پیش آمده، مجدد بارگذاری کنید!");
			return Promise.reject(error);
		} finally {
			setLoading(false);
		}
	};

	async function removeFile(key: string) {
		try {
			setLoading(true);
			const remainingDocs = documents.filter((doc) => doc.key !== key);
			const docs = documents.filter((doc) => doc.key === key);
			await Promise.all(
				docs.map(async (docs) => {
					await DeleteUserDocumentsFile({ fileId: docs.id });
				}),
			);
			setDocuments(remainingDocs);
			setValue(key as any, undefined);
		} catch (error) {
			toast.error("خطایی رخ داده، مجدد تلاش کنید!");
		} finally {
			setLoading(false);
		}
	}

	const removeOtherFile = async (title: string, id: string, index: number) => {
		try {
			setLoading(true);
			const remainingDocs = otherDoc.filter((doc) => doc.id !== id);

			const others = fields.other.filter((field) => field.id !== id);
			await DeleteUserDocumentsFile({ fileId: id });

			setValue("other", others);
			setOtherDoc(remainingDocs);
			remove(index);
		} catch (error) {
			toast.error("خطایی رخ داده، مجدد تلاش کنید!");
		} finally {
			setLoading(false);
		}
	};
	if (pageLoading) {
		return <Loading size={"md"}>درحال دریافت اطلاعات...</Loading>;
	}

	return (
		<>
			<div className="grid grid-cols-4 gap-y-6">
				<div className="col-span-3 grid grid-cols-1 gap-x-20 gap-y-8 xs:grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 xl:grid-cols-12">
					<div className="col-span-full flex xs:col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-3">
						<div>
							<label htmlFor="nationalFrontCard" className="basis-32">
								روی کارت ملی:
							</label>
							{loading ? (
								<SkeletonLoading />
							) : (
								<div className="mt-2 flex grow gap-1">
									<FileInput
										loading={loading}
										setFile={async (v) => {
											try {
												await uploadFile({
													title: "روی کارت ملی",
													key: "nationalFrontCard",
													v: v as File,
												});
												setValue("nationalFrontCard", v as File);
											} catch (error) {
												console.error(error);
											}
										}}
										onRemove={() => removeFile("nationalFrontCard")}
										file={fields.nationalFrontCard}
									/>
									<FieldError error={errors["nationalFrontCard"]} />
								</div>
							)}
						</div>
					</div>

					<div className="col-span-full flex xs:col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-3">
						<div>
							<label htmlFor="nationalBackCard" className="basis-32">
								پشت کارت ملی:
							</label>
							{loading ? (
								<SkeletonLoading />
							) : (
								<div className="mt-2 grow">
									<FileInput
										loading={loading}
										setFile={async (v) => {
											try {
												await uploadFile({
													title: "پشت کارت ملی",
													key: "nationalBackCard",
													v: v as File,
												});
												setValue("nationalBackCard", v as File);
											} catch (error) {
												console.error(error);
											}
										}}
										onRemove={async () => await removeFile("nationalBackCard")}
										file={fields.nationalBackCard}
									/>
									<FieldError error={errors["nationalBackCard"]} />
								</div>
							)}
						</div>
					</div>

					<div className="col-span-full flex xs:col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-3">
						<div>
							<label htmlFor="birthCertificate" className="basis-32">
								صفحه اول شناسنامه:
							</label>
							{loading ? (
								<SkeletonLoading />
							) : (
								<div className="mt-2 grow">
									<FileInput
										loading={loading}
										setFile={async (v) => {
											try {
												await uploadFile({
													title: "صفحه اول شناسنامه",
													key: "birthCertificate",
													v: v as File,
												});
												setValue("birthCertificate", v as File);
											} catch (error) {
												console.error(error);
											}
										}}
										onRemove={async () => await removeFile("birthCertificate")}
										file={fields.birthCertificate}
									/>
									<FieldError error={errors["birthCertificate"]} />
								</div>
							)}
						</div>
					</div>

					<div className="col-span-full flex xs:col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-3">
						<div>
							<label
								htmlFor="birthCertificateMarriagePage"
								className="basis-32"
							>
								صفحه ازدواج شناسنامه:
							</label>
							{loading ? (
								<SkeletonLoading />
							) : (
								<div className="mt-2 grow">
									<FileInput
										loading={loading}
										setFile={async (v) => {
											try {
												await uploadFile({
													title: "صفحه ازدواج شناسنامه",
													key: "birthCertificateMarriagePage",
													v: v as File,
												});
												setValue("birthCertificateMarriagePage", v as File);
											} catch (error) {
												console.error(error);
											}
										}}
										onRemove={async () =>
											await removeFile("birthCertificateMarriagePage")
										}
										file={fields.birthCertificateMarriagePage}
									/>
									<FieldError error={errors["birthCertificateMarriagePage"]} />
								</div>
							)}
						</div>
					</div>

					<div className="col-span-full flex xs:col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-3">
						<div>
							<label htmlFor="personnelPhoto" className="basis-32">
								عکس پرسنلی:
							</label>
							{loading ? (
								<SkeletonLoading />
							) : (
								<div className="mt-2 grow">
									<FileInput
										loading={loading}
										setFile={async (v) => {
											try {
												await uploadFile({
													title: "عکس پرسنلی",
													key: "personnelPhoto",
													v: v as File,
												});
												setValue("personnelPhoto", v as File);
											} catch (error) {
												console.error(error);
											}
										}}
										onRemove={async () => await removeFile("personnelPhoto")}
										file={fields.personnelPhoto}
									/>
									<FieldError error={errors["personnelPhoto"]} />
								</div>
							)}
						</div>
					</div>

					<div className="col-span-full flex xs:col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-3">
						<div>
							<label htmlFor="militaryCard" className="basis-32">
								کارت پایان خدمت یا معافیت:
							</label>
							{loading ? (
								<SkeletonLoading />
							) : (
								<div className="mt-2 grow">
									<FileInput
										loading={loading}
										setFile={async (v) => {
											try {
												await uploadFile({
													title: "کارت پایان خدمت یا معافیت",
													key: "militaryCard",
													v: v as File,
												});
												setValue("militaryCard", v as File);
											} catch (error) {
												console.error(error);
											}
										}}
										onRemove={async () => await removeFile("militaryCard")}
										file={fields.militaryCard}
									/>
									<FieldError error={errors["militaryCard"]} />
								</div>
							)}
						</div>
					</div>

					<div className="col-span-full flex xs:col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-3">
						<div>
							<div className="flex justify-between">
								<label htmlFor="degree" className="basis-32">
									مدرک تحصیلی:
								</label>
							</div>
							{loading ? (
								<SkeletonLoading />
							) : (
								<div className="mt-2 grow">
									<div className="flex items-center">
										<FileInput
											loading={loading}
											setFile={async (v) => {
												try {
													await uploadFile({
														title: "مدرک تحصیلی",
														key: "degree",
														v: v as File,
													});
													setValue("degree", v as File);
												} catch (error) {
													console.error(error);
												}
											}}
											onRemove={async () => await removeFile("degree")}
											file={fields.degree}
										/>
									</div>
									<FieldError error={errors["degree"]} />
								</div>
							)}
						</div>
					</div>

					<div className="col-span-full flex xs:col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-3">
						<div>
							<div className="flex justify-between">
								<label htmlFor="degree" className="basis-32">
									سوء پیشینه:
								</label>
							</div>
							{loading ? (
								<SkeletonLoading />
							) : (
								<div className="mt-2 grow">
									<div className="flex items-center">
										<FileInput
											loading={loading}
											setFile={async (v) => {
												try {
													await uploadFile({
														title: "سوء پیشینه",
														key: "criminalRecord",
														v: v as File,
													});
													setValue("criminalRecord", v as File);
												} catch (error) {
													console.error(error);
												}
											}}
											onRemove={async () => await removeFile("criminalRecord")}
											file={fields.criminalRecord}
										/>
									</div>
									<FieldError error={errors["criminalRecord"]} />
								</div>
							)}
						</div>
					</div>
					<div className="col-span-full flex xs:col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-3">
						<div className="flex min-w-fit flex-col gap-14">
							<div className="flex justify-between">
								<label htmlFor="degree" className="basis-32">
									امضا:
								</label>
							</div>
							<div className="mt-2 min-w-fit grow">
								<div className="flex flex-col items-center justify-start">
									{/* {fields.Signature && (
                    <Image
                      src={URL.createObjectURL(fields.Signature)}
                      alt=""
                      width={100}
                      height={100}
                    />
                  )} */}
									<SignaturePad
										setSignature={async (v) => {
											const blob = dataURLtoBlob(v);
											const file = new File([blob], "signature.png", {
												type: blob.type,
											});
											try {
												await uploadFile({
													title: "امضا",
													key: "signature",
													v: file,
												});
												setValue("signature", file);
											} catch (error) {
												console.error(error);
											}
										}}
										signature={
											fields.signature
												? URL.createObjectURL(fields.signature)
												: undefined
										}
										clearSignature={async () => await removeFile("signature")}
									/>
								</div>
								<FieldError error={errors["signature"]} />
							</div>
						</div>
					</div>

					<div className="col-span-full col-start-1">
						<div className="h-1 bg-gray-100"></div>
					</div>
					{loading ? (
						documents
							.filter((document) => document.key === null)
							.map((document, index) => (
								<div
									key={index}
									className="col-span-full flex flex-col gap-1 xs:col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-3"
								>
									<div>
										<Input
											type="text"
											className="w-[180px] rounded-md"
											placeholder="عنوان مدرک"
											disabled={document.id !== ""}
											value={document.title}
											onChange={(e) =>
												setValue(
													`other.${index}.title`,
													e.target.value
														.replace(/^\s/, "")
														.replace(/\s\s+/g, " "),
													{
														shouldDirty: true,
														shouldTouch: true,
														shouldValidate: true,
													},
												)
											}
										/>
									</div>
									<SkeletonLoading />
								</div>
							))
					) : (
						<div className="col-span-full grid grid-cols-1 gap-x-20 gap-y-8 xs:grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 xl:grid-cols-12">
							{fields.other.map((field, index) => {
								register(`other.${index}.title`, {
									required: "وارد کردن عنوان الزامیست",
								});
								register(`other.${index}.file`, {
									required: messages.validation.required,
								});
								return (
									<div
										key={index}
										className="col-span-full mb-6 flex items-start xs:col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-3"
									>
										<div className="flex basis-32 flex-col items-start gap-1">
											<div>
												<Input
													type="text"
													className="w-[180px] rounded-md"
													placeholder="عنوان مدرک"
													disabled={field.id !== ""}
													value={field.title}
													onChange={(e) =>
														setValue(
															`other.${index}.title`,
															e.target.value
																.replace(/^\s/, "")
																.replace(/\s\s+/g, " "),
															{
																shouldDirty: true,
																shouldTouch: true,
																shouldValidate: true,
															},
														)
													}
												/>
											</div>

											{field.title !== "" && (
												<div className="!ml-0 max-w-[179px] grow">
													<FileInput
														loading={loading}
														setFile={async (v) => {
															try {
																await uploadFile({
																	title: field.title,
																	v: v as File,
																});
																setValue(`other.${index}.file`, v as File, {
																	shouldDirty: true,
																	shouldTouch: true,
																	shouldValidate: true,
																});
															} catch (error) {
																console.error(error);
															}
														}}
														file={field.file}
														onRemove={async () => {
															await removeOtherFile(
																field.title,
																field.id,
																index,
															);
														}}
													/>
													<FieldError error={errors.other?.[index]?.file} />
												</div>
											)}
											<FieldError error={errors.other?.[index]?.title} />
										</div>
										{/* <MdDeleteForever
                    className={`hover:text-red-600 transition-all delay-75 cursor-pointer mt-2 min-w-[20px] min-h-[20px] p-0 ${
                      loading ? "text-gray-400" : "text-red-500"
                    }  `}
                    size={"1.4rem"}
                    data-tooltip-id="removeDegree"
                    onClick={() => !loading && remove(index)} 
                  /> */}
									</div>
								);
							})}
							{(fields.other[fields.other.length - 1]?.id !== "" ||
								!fields.other.length) && (
								<Button
									className="col-span-full w-44"
									disabled={loading}
									type="button"
									variant="primary"
									onClick={handleAddDegree}
								>
									اضافه کردن مدرک دلخواه
								</Button>
							)}
						</div>
					)}
				</div>
			</div>
			<Tooltip id={`removeDegree`}>حذف کردن</Tooltip>
		</>
	);
}

const SkeletonLoading = () => (
	<>
		<div role="status" className="mt-2 w-full grow animate-pulse">
			<div className="flex h-24 w-[180px] items-center justify-center rounded !bg-gray-300">
				<svg
					className="h-10 w-full !text-gray-200"
					aria-hidden="true"
					xmlns="http://www.w3.org/2000/svg"
					fill="currentColor"
					viewBox="0 0 20 18"
				>
					<path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
				</svg>
			</div>
		</div>
	</>
);

const dataURLtoBlob = (dataURL: string): Blob => {
	const arr = dataURL.split(",");
	const mime = arr[0].match(/:(.*?);/)?.[1];
	const bstr = atob(arr[1]);
	let n = bstr.length;
	const u8arr = new Uint8Array(n);
	while (n--) {
		u8arr[n] = bstr.charCodeAt(n);
	}
	return new Blob([u8arr], { type: mime });
};
// const dataURLtoFile = (dataURL: string, filename: string): File => {
//   const arr = dataURL.split(",");
//   const mime = arr[0].match(/:(.*?);/)?.[1];
//   const bstr = atob(arr[1]);
//   let n = bstr.length;
//   const u8arr = new Uint8Array(n);
//   while (n--) {
//     u8arr[n] = bstr.charCodeAt(n);
//   }
//   return new File([u8arr], filename, { type: mime });
// };
// const dataURLtoBlob = (dataURL:string) => {
//   const arr = dataURL.split(",");
//   const mime = arr[0].match(/:(.*?);/)[1];
//   const bstr = atob(arr[1]);
//   let n = bstr.length;
//   const u8arr = new Uint8Array(n);
//   while (n--) {
//     u8arr[n] = bstr.charCodeAt(n);
//   }
//   return new Blob([u8arr], { type: mime });
// };
