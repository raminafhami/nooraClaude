import { useEffect, useState } from "react";
import { toast } from "sonner";

import PutTicketStatus from "@/api/ticketsapi/putTicketStatus";
import { Loading } from "@/ui/Loader";
import MyModal from "@/ui/Modal/contextlessModal/Modal";

interface ChangeStatusticketsProps {
	isShow: boolean;
	setShow: (isShow?: any) => void;
	data: any;
	getData: () => void;
}

export default function ChangeStatustickets({
	isShow,
	setShow,
	data,
	getData,
}: ChangeStatusticketsProps) {
	const [loading, setLoading] = useState<boolean>(false);
	const [status, setStatus] = useState<string>(data?.status);
	async function changeStatus() {
		setLoading(true);
		try {
			let response = await PutTicketStatus({
				id: data.id,
				status: status,
			});
			if (response) {
				setShow(false);
				setTimeout(() => {
					getData();
					setLoading(false);
					toast.success("با موفقیت ثبت شد!");
				}, 500);
			}
		} catch (e) {
			setLoading(false);
			setShow(false);
			toast.error("خطایی رخ داد!");
		}
	}
	useEffect(() => {
		if (data) {
			setStatus(data.status);
		}
	}, [data]);
	return (
		<>
			{
				<MyModal
					size="xl"
					title={`تغییر وضعیت ${data.subject}`}
					content={
						<>
							<div className="my-6 flex justify-center">
								{loading ? (
									<Loading size={"sm"} />
								) : (
									<div className="flex flex-col rounded-xl bg-gray-100 p-10">
										<div className="relative flex flex-col">
											<label className="mx-[1.5rem] my-[.5rem] select-none">
												تغییر وضعیت به
											</label>

											<select
												onChange={(event) => setStatus(event.target.value)}
												className={`group relative mx-[1rem] mb-[1rem] w-[300px] text-ellipsis rounded-2xl border-2 border-white bg-white px-2 py-2 pl-[2.8rem] pr-[2rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
												defaultValue={status ? status : "undefined"}
											>
												<option
													value={"undefined"}
													disabled
													selected={status ? false : true}
												>
													انتخاب
												</option>
												<option
													value={"in-progress"}
													selected={status ? false : true}
												>
													در حال بررسی
												</option>
												<option
													value={"closed"}
													selected={status ? false : true}
												>
													بسته شده
												</option>
												<option value={"open"} selected={status ? false : true}>
													در حال اجرا
												</option>
												<option
													value={"on-hold"}
													selected={status ? false : true}
												>
													متوقف شده
												</option>
											</select>
										</div>
										<div className="w-full">
											<button
												onClick={() => !loading && changeStatus()}
												className={`group relative float-left mx-[1rem] mb-[1rem] mt-[1rem] w-[300px] text-ellipsis rounded-2xl border-2 bg-blue-500 py-2 text-[.9rem] text-white hover:bg-blue-700 focus:border-blue-500 focus:text-black focus:outline-0`}
											>
												{loading ? (
													<Loading
														className="flex justify-center"
														size={"sm"}
													/>
												) : (
													"ثبت"
												)}
											</button>
										</div>
									</div>
								)}
							</div>
						</>
					}
					name="addParticipant"
					onClose={() => setShow(false)}
					show={isShow}
				/>
			}
		</>
	);
}
