import { useEffect, useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { toast } from "sonner";

import GetAllProducts from "@/api/products/getAllProducts";

interface FindProductProps {
	product: Product | undefined;
	setProduct: (product: Product | undefined) => void;
}

export type Product = {
	name?: string;
	categoryId?: string;
	counter?: string;
	id?: string;
	quantity?: string;
};

export default function FindProduct({ product, setProduct }: FindProductProps) {
	const [users, setUsers] = useState<Array<Product> | undefined>();
	const [searchedName, setSearchedName] = useState<string>();

	async function getproduct() {
		let res;
		try {
			res = GetAllProducts({
				page: 0,
				size: 999,
				searchByName: searchedName,
			});
			res.then((res) => {
				setUsers(res.result?.data);
			});
		} catch (err) {
			toast.error("خطایی رخ داد!");
		}
	}

	useEffect(() => {
		const delayDebounceFn = setTimeout(() => {
			if (searchedName && searchedName?.length > 1) {
				getproduct();
			} else {
				setUsers(undefined);
			}
		}, 300);
		return () => {
			clearTimeout(delayDebounceFn);
		};
	}, [searchedName]);

	return (
		<div className={`relative flex flex-col ${product ? "mb-2" : ""}`}>
			<input
				className={`group relative mx-[1rem] mb-[1rem] mt-[1rem] w-[300px] text-ellipsis rounded rounded-2xl border-2 border-white bg-white px-2 py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
				type="text"
				placeholder="نام محصول"
				onChange={(event) =>
					setSearchedName(
						event.target.value.replace(/^\s+/, "").replace(/\s\s+/g, " "),
					)
				}
				value={product ? `${product.name}` : searchedName ? searchedName : ""}
				disabled={product ? true : false}
			/>
			{!product && users?.length ? (
				<div className="absolute right-[1rem] top-[3.5rem] z-10 mb-[10rem] max-h-[288px] w-[300px] overflow-y-scroll rounded bg-gray-200">
					{users?.map((user, index) => (
						<p
							key={index}
							onClick={() => {
								setProduct(user);
								setUsers(undefined);
							}}
							className="cursor-pointer rounded py-2 pr-3 hover:bg-blue-400 hover:text-white"
						>
							{user.name}
						</p>
					))}
				</div>
			) : (
				searchedName &&
				!product && (
					<span className="absolute bottom-[-.5rem] right-[1.2rem] text-red-600">
						موردی یافت نشد!
					</span>
				)
			)}
			{product && (
				<span className="mx-[1rem] w-fit rounded-2xl bg-gray-200 p-2">
					{product?.name}
					<RxCross2
						data-tooltip-id="filterCleaner"
						size={15}
						className="mr-2 inline-flex cursor-pointer hover:text-red-500"
						onClick={() => {
							setProduct(undefined);
							setSearchedName(undefined);
						}}
					/>
				</span>
			)}
		</div>
	);
}
