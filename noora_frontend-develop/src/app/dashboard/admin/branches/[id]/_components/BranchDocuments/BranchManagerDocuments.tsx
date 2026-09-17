import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { PaymentRule } from "@/financial/payment-rules/models/PaymentRule";
import { UserDocument } from "@/identity/userDocuments/models/UserDocument";
import DeleteUserDocumentsFile from "@/identity/userDocuments/services/deleteUserDocumentFile";
import GetAllUserDocuments from "@/identity/userDocuments/services/getAllUserDocuments";
import GetUserDocumentsFile from "@/identity/userDocuments/services/getUserDocumentsFile";
import PostUserDocument from "@/identity/userDocuments/services/postUserDocument";
import FileInput from "@/ui/FileInput";
import { Head } from "@/ui/Head";

import { useBranchContext } from "../BranchContext";

interface Props {
	rule: PaymentRule | null;
	onRuleEditCancel: (rule: null) => void;
	onRuleUpdate: (rule: PaymentRule) => void;
}

interface Documents {
	file: File | Blob;
	id: string;
}

export function BranchManagerDocuments(): React.ReactNode {
	const [loading, setLoading] = useState<boolean>(false);
	const [contractDoc, setContractDoc] = useState<Documents | null>(null);
	const [leaseDoc, setLeaseDoc] = useState<Documents | null>(null);
	const [postalDoc, setPostalDoc] = useState<Documents | null>(null);
	const { branch } = useBranchContext();

	const getDocuments = useCallback(
		async function getDocuments() {
			setLoading(true);
			if (branch.managerId) {
				try {
					const document = await GetAllUserDocuments({
						page: 0,
						size: 999,
						userId: branch.managerId,
					});

					await Promise.all(
						document.map(async (doc: UserDocument) => {
							if (doc.key === "CollaborationContract") {
								await getFile(doc.id, doc.key, doc.title);
							}
							if (doc.key === "Lease") {
								await getFile(doc.id, doc.key, doc.title);
							}
							if (doc.key === "PostalCodeVerification") {
								await getFile(doc.id, doc.key, doc.title);
							}
						}),
					);
				} catch (error) {
					toast.error("خطایی در دریافت مدارک رخ داد!");
				}
			}
			setLoading(false);
		},
		[branch.managerId],
	);

	useEffect(() => {
		getDocuments();
	}, [getDocuments]);

	async function getFile(fileId: string, key: string | null, title: string) {
		try {
			const res: Blob = await GetUserDocumentsFile({ fileId: fileId });
			if (res) {
				if (key === "CollaborationContract") {
					setContractDoc({ file: res, id: fileId });
				}
				if (key === "Lease") {
					setLeaseDoc({ file: res, id: fileId });
				}
				if (key === "PostalCodeVerification") {
					setPostalDoc({ file: res, id: fileId });
				}
			}
		} catch (error) {
			toast.error("خطایی در دریافت مدارک رخ داد!");
		}
	}

	const uploadFile = async ({
		title,
		key,
		v,
	}: {
		title: string;
		key?: string;
		v: File;
	}) => {
		if (branch.managerId) {
			try {
				setLoading(true);
				await PostUserDocument({
					file: v,
					title,
					status: "confirm",
					key,

					userId: branch.managerId,
				}).then((res) => {
					if (key === "CollaborationContract") {
						setContractDoc({ file: v, id: res.result.id });
						console.log(res);
					}
					if (key === "Lease") {
						setLeaseDoc({ file: v, id: res.result.id });
					}
					if (key === "PostalCodeVerification") {
						setPostalDoc({ file: v, id: res.result.id });
					}
				});

				return Promise.resolve();
			} catch (error) {
				toast.error("مشکلی پیش آمده، مجدد بارگذاری کنید!");
				return Promise.reject(error);
			} finally {
				setLoading(false);
			}
		}
	};

	const removeFile = async (key: string) => {
		try {
			setLoading(true);

			if (key === "CollaborationContract" && contractDoc?.id) {
				await DeleteUserDocumentsFile({ fileId: contractDoc?.id }).then(() => {
					setContractDoc(null);
				});
			}
			if (key === "Lease" && leaseDoc?.id) {
				await DeleteUserDocumentsFile({ fileId: leaseDoc?.id }).then(() => {
					setLeaseDoc(null);
				});
			}
			if (key === "PostalCodeVerification" && postalDoc?.id) {
				await DeleteUserDocumentsFile({ fileId: postalDoc?.id }).then(() => {
					setPostalDoc(null);
				});
			}
		} catch (error) {
			toast.error("خطایی رخ داده، مجدد تلاش کنید!");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-w-full space-y-8">
			<Head.Root>
				<Head.Title>مدارک شعبه</Head.Title>
			</Head.Root>
			<div className="flex min-w-full flex-wrap items-center gap-5">
				<div>
					<label htmlFor="nationalFrontCard" className="basis-32">
						قرارداد همکاری:
					</label>
					<div className="mt-2 flex gap-1">
						<FileInput
							loading={loading}
							setFile={async (v) => {
								try {
									await uploadFile({
										title: "قرارداد همکاری",
										key: "CollaborationContract",
										v: v as File,
									});
								} catch (error) {
									console.error(error);
								}
							}}
							onRemove={() => removeFile("CollaborationContract")}
							file={contractDoc?.file}
						/>
					</div>
				</div>

				<div>
					<label htmlFor="nationalFrontCard" className="basis-32">
						اجاره نامه:
					</label>
					<div className="mt-2 flex gap-1">
						<FileInput
							loading={loading}
							setFile={async (v) => {
								try {
									await uploadFile({
										title: "اجاره نامه",
										key: "Lease",
										v: v as File,
									});
								} catch (error) {
									console.error(error);
								}
							}}
							onRemove={() => removeFile("Lease")}
							file={leaseDoc?.file}
						/>
					</div>
				</div>

				<div>
					<label htmlFor="nationalFrontCard" className="basis-32">
						تاییدیه کدپستی:
					</label>
					<div className="mt-2 flex gap-1">
						<FileInput
							loading={loading}
							setFile={async (v) => {
								try {
									await uploadFile({
										title: "تاییدیه کدپستی",
										key: "PostalCodeVerification",
										v: v as File,
									});
								} catch (error) {
									console.error(error);
								}
							}}
							onRemove={() => removeFile("PostalCodeVerification")}
							file={postalDoc?.file}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
