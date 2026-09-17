import moment from "moment";
import { useEffect, useState } from "react";
import { FaDownload, FaEye } from "react-icons/fa";
import { toast } from "sonner";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { FileApi } from "@/felo/files/models/File";
import { getInstanceFile } from "@/felo/files/services/getFile";
import { getInstanceRawFiles } from "@/felo/files/services/getRawFiles";
import { Loading } from "@/ui/Loader";
import MyModal from "@/ui/Modal/contextlessModal/Modal";

interface FinancialFilesModalProps {
	isShow: boolean;
	setShow: (isShow?: any) => void;
	instanceId: string;
}

export default function FinancialFilesModal({
	isShow,
	setShow,
	instanceId,
}: FinancialFilesModalProps) {
	const [loading, setLoading] = useState<boolean>(false);
	const [filesList, setFilesList] = useState<FileApi[]>([]);

	async function handleDownloadFile(fileId: string, fileName: string) {
		setLoading(true);
		try {
			let res = await getInstanceFile(fileId);
			if (res) {
				const blob = res;
				const url = window.URL.createObjectURL(new Blob([blob]));
				const link = document.createElement("a");
				link.href = url;
				link.setAttribute(
					"download",
					`collection-${moment(new Date())
						.locale("fa")
						.format("YYYY/MM/DD")}.${fileName}`,
				);
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				window.URL.revokeObjectURL(url);
				toast.success("فایل مورد نظر با موفقیت ذخیره شد!");
				setLoading(false);
			}
		} catch (e: any) {
			console.log(e);
			setLoading(false);
		}
	}

	useEffect(() => {
		(async function () {
			setLoading(true);
			try {
				let res = await getInstanceRawFiles({ instanceId });
				if (res) {
					setFilesList(res);
					setLoading(false);
				}
			} catch (e: any) {
				console.error(e);
				setLoading(false);
			}
		})();
	}, [instanceId]);

	return (
		<>
			{/* <MyModal
          size="6xl"
          title=""
          content={
            <>
              {filesList?.length && !loading ? (
                <Table className="w-full my-4">
                  <TableHeader className="text-center bg-gray-100 ">
                    <TableRow>
                      <TableHead className="text-center">ردیف</TableHead>
                      <TableHead className="text-center">عنوان</TableHead>
                      <TableHead className="text-center">عملیات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={10}>
                          در حال دریافت اطلاعات... <Loading size={"sm"} />
                        </TableCell>
                      </TableRow>
                    ) : (
                      filesList?.map((data, index) => {
                        return (
                          <TableRow key={data?.id}>
                            <TableCell className="text-center">
                              {index + 1}
                            </TableCell>
                            <TableCell className="text-center">
                              {data?.filename}
                            </TableCell>
                            <TableCell className="text-center">
                              <FaDownload
                                className="cursor-pointer inline hover:text-gray-500 transition-all"
                                onClick={() => {
                                  handleDownloadFile(
                                    data?.id,
                                    data?.filename?.split(".").pop() as string,
                                  );
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              ) : (
                <Table className="w-full my-4">
                  <TableHeader className="text-center bg-gray-100 ">
                    <TableRow>
                      <TableHead className="text-center">ردیف</TableHead>
                      <TableHead className="text-center">عنوان</TableHead>
                      <TableHead className="text-center">عملیات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={10}>اطلاعاتی یافت نشد...</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              )}
            </>
          }
          name="addParticipant"
          onClose={() => setShow(false)}
          show={isShow}
        /> */}
			<Dialog open={isShow} onOpenChange={setShow}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>مدارک درخواست</DialogTitle>
					</DialogHeader>
					<div>
						{filesList?.length && !loading ? (
							<Table className="my-4 w-full">
								<TableHeader className="bg-gray-100 text-center">
									<TableRow>
										<TableHead className="text-center">ردیف</TableHead>
										<TableHead className="text-center">عنوان</TableHead>
										<TableHead className="text-center">عملیات</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{loading ? (
										<TableRow>
											<TableCell className="text-right" colSpan={10}>
												<p className="flex items-center">
													<span className="ml-2 w-fit text-nowrap">
														{" "}
														در حال دریافت اطلاعات...{" "}
													</span>
													<Loading size={"sm"} />
												</p>
											</TableCell>
										</TableRow>
									) : (
										filesList?.map((data, index) => {
											return (
												<TableRow key={data?.id}>
													<TableCell className="text-center">
														{index + 1}
													</TableCell>
													<TableCell className="text-center">
														{data?.filename}
													</TableCell>
													<TableCell className="text-center">
														<FaDownload
															className="inline cursor-pointer transition-all hover:text-gray-500"
															onClick={() => {
																handleDownloadFile(
																	data?.id,
																	data?.filename?.split(".").pop() as string,
																);
															}}
														/>
													</TableCell>
												</TableRow>
											);
										})
									)}
								</TableBody>
							</Table>
						) : (
							<Table className="my-4 w-full">
								<TableHeader className="bg-gray-100 text-center">
									<TableRow>
										<TableHead className="text-center">ردیف</TableHead>
										<TableHead className="text-center">عنوان</TableHead>
										<TableHead className="text-center">عملیات</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									<TableRow>
										<TableCell className="text-right" colSpan={10}>
											اطلاعاتی یافت نشد...
										</TableCell>
									</TableRow>
								</TableBody>
							</Table>
						)}
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
