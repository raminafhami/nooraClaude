import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import DeleteFormById from "@/api/forms/deleteFormById";
import { Loading } from "@/ui/Loader";
import MyModal from "@/ui/Modal/contextlessModal/Modal";

import { Evaluation } from "../../data/EvaluationFormTypes";

interface DeleteFormProps {
	isShow: boolean;
	setShow: (isShow?: any) => void;
	data: Evaluation;
}

export default function DeleteForm({ isShow, setShow, data }: DeleteFormProps) {
	const [loading, setLoading] = useState<boolean>(false);
	const router = useRouter();
	async function deleteUser() {
		setLoading(true);
		try {
			let response = await DeleteFormById({
				id: data.id,
			});
			if (response) {
				setShow(false);
				setTimeout(() => {
					setLoading(false);
					router.push("/dashboard/evaluation-form");
				}, 500);
			}
		} catch (e) {
			setLoading(false);
			toast.error("خطایی رخ داد!");
		}
		setLoading(false);
	}

	return (
		<>
			{
				<MyModal
					size="xl"
					title={`حذف ${data.title}`}
					content={
						<>
							<div className="my-6 flex justify-center">
								{loading ? (
									<Loading size={"sm"} />
								) : (
									<>
										<button
											onClick={() => setShow(false)}
											className="mx-10 rounded bg-blue-400 px-4 px-8 py-2 text-white hover:bg-blue-500"
										>
											لغو
										</button>
										<button
											onClick={() => deleteUser()}
											className="mx-10 rounded bg-red-400 px-4 px-8 py-2 text-white hover:bg-red-500"
										>
											حذف
										</button>
									</>
								)}
							</div>
						</>
					}
					name="addParticipant"
					onClose={() => setShow(false)}
					show={isShow}
				/>
			}
			{/* <>
                <AiOutlineUsergroupAdd
                    data-tooltip-id="addParticipantModal"
                    size={20}
                    className="inline-flex text-blue-500 cursor-pointer outline-0 ml-2"
                    onClick={() => addModalOnOpen()}
                />
            </> */}
		</>
	);
}
