import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import DeleteProductById from "@/api/products/deleteProductById";
import { Button } from "@/components/ui/button";
import { Loading } from "@/ui/Loader";
import MyModal from "@/ui/Modal/contextlessModal/Modal";

interface DeleteProductProps {
	isShow: boolean;
	setShow: (isShow?: any) => void;
	data: any;
}

export default function DeleteProduct({
	isShow,
	setShow,
	data,
}: DeleteProductProps) {
	const [loading, setLoading] = useState<boolean>(false);
	const router = useRouter();
	async function deleteUser() {
		setLoading(true);
		try {
			let response = await DeleteProductById({
				id: data.id,
			});
			if (response) {
				setShow(false);
				setTimeout(() => {
					setLoading(false);
					router.push("/dashboard/storage");
				}, 500);
			}
		} catch (e) {
			setLoading(false);
			setShow(false);
			toast.error("خطایی رخ داد!");
		}
		setLoading(false);
	}

	return (
		<>
			{
				<MyModal
					size="xl"
					title={`حذف ${data.name}`}
					content={
						<>
							<div className="my-6 flex justify-center gap-x-4">
								{loading ? (
									<Loading size={"sm"} />
								) : (
									<>
										<Button onClick={() => setShow(false)}>لغو</Button>

										<Button variant="destructive" onClick={() => deleteUser()}>
											حذف
										</Button>
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
