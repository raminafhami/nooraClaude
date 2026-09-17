"use client";

import { useCallback, useState } from "react";
import { FaPlus } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { LowStockProductList } from "@/products/components/LowStockProductList";
import { ProductList } from "@/products/components/ProductList";
import { Head } from "@/ui/Head";

import AddNewCategory from "./modal/AddNewCategory";
import AddNewProduct from "./modal/AddNewProduct";

function ProductsPage() {
	const [isModal, setIsModal] = useState<boolean>(false);
	const [isCategoryModal, setIsCategoryModal] = useState<boolean>(false);

	const [shouldRefetch, setShouldRefetch] = useState<boolean>();

	const handleRefetch = useCallback(() => {
		setShouldRefetch((prev) => !prev);
	}, []);

	return (
		<>
			<div className="space-y-8">
				<Head.Root>
					<Head.Title>کالاها</Head.Title>
					<Head.Nav className="sm:ms-auto">
						<Button
							type="button"
							variant="primary"
							onClick={() => setIsModal(true)}
						>
							<FaPlus />
							<span>افزودن محصول</span>
						</Button>
						<Button
							type="button"
							variant="primary"
							onClick={() => setIsCategoryModal(true)}
						>
							<FaPlus />
							<span>افزودن دسته بندی</span>
						</Button>
					</Head.Nav>
				</Head.Root>

				<LowStockProductList shouldRefetch={shouldRefetch} />
				<ProductList shouldRefetch={shouldRefetch} onChange={handleRefetch} />
			</div>

			{isModal && (
				<AddNewProduct
					key="addProduct"
					isShow={isModal}
					setShow={setIsModal}
					getData={handleRefetch}
				/>
			)}

			{isCategoryModal && (
				<AddNewCategory
					key="addcategory"
					isShow={isCategoryModal}
					setShow={setIsCategoryModal}
				/>
			)}
		</>
	);
}

export { ProductsPage };
